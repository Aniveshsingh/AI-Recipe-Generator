const callGroq = async (prompt) => {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_completion_tokens: 1000,
        top_p: 1,
        stream: false,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Groq failed");
  }

  return data.choices[0].message.content;
};

const callGemini = async (prompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  const data = await response.json();

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return text.replace(/```json|```/g, "").trim();
};

const generateRecipeText = async (prompt) => {
  try {
    console.log("Trying Groq...");
    return await callGroq(prompt);
  } catch (err) {
    console.log("Groq failed → switching to Gemini", err.message);

    try {
      return await callGemini(prompt);
    } catch (err2) {
      console.error("Both AI providers failed", err2.message);
      throw new Error("AI service unavailable");
    }
  }
};

const cleanJSON = (text) => {
  // remove markdown ```json ```
  let cleaned = text.replace(/```json|```/g, "").trim();

  // extract only JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON found");
  }

  return cleaned.slice(start, end + 1);
};

const safeParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = cleanJSON(text);
    return JSON.parse(cleaned);
  }
};

export const generateRecipe = async (req, res) => {
  try {
    const { ingredients, cuisine, diet, servings, cookingTime } = req.body;

    const prompt = `
Return ONLY valid JSON.
No markdown.
No explanation.
No extra text.


STRICT RULES:
1. Output must start with { and end with }
2. Do NOT include backticks
3. Do NOT include comments
4. Along with standard instructions, you MUST STRICTLY include cuisine-specific cooking intelligence (DO NOT SKIP ANY OF THE BELOW STEPS, EVERY DETAIL IS ESSENTIAL): 
  a. Provide exact ingredient measurements (grams, ml, teaspoons, etc.).
  b. Cooking Technique Cues:
   - Explain traditional cooking indicators unique to this cuisine
   - Example: oil separation, masala thickening, butter foaming, sauce emulsification

  c. Doneness Signals:
   - Visual, aroma, and texture cues (not just time-based)
   - Example: “cook until masala leaves oil”, “onions turn deep golden, not burnt”

  d. Recovery Fixes (Very Important):
   - What to do if something goes wrong at each stage
   - Example: 
     - If masala is dry → add 1 tbsp water or ghee
     - If spices burn → lower heat + add liquid immediately

  e. Flavor Balancing Logic:
   - How to adjust salt, acidity, spice level according to cuisine style

  f. Authentic Tips (IMPORTANT STEP, NEEDS TO BE STRICTLY FOLLOWED):
   - Small insider tricks used in that cuisine (home-style or restaurant-style)
   - Tips & mistakes to avoid
   - Final texture and taste description

  g. Heat Control Strategy:
   - STRICTLY Explain WHY low/medium/high heat is used at each step

  h.  For every step, add exact time to cook also include in a square brackets [Heat:"", visual doneness:""] at every line end:
   - Heat level (low/medium/high or flame intensity)
   - Visual doneness cues (e.g., “until onions turn golden brown”, “until oil separates”)

  i. Clearly specify:
   - When to stir and how frequently
   - When to cover/uncover
   - When to add each ingredient (no assumptions)


6. UNIQUE RECIPES (VERY STRICTLY FOLLOWED):
   - Ensure this recipe is a unique variation by modifying:
     - spice ratios
     - cooking techniques
     - ingredient combinations
   - PREVIOUSLY GENERATED PATTERNS SHOULD BE AVOIDED. RECIPES HOULD NOT GET REPEATED

7. Variation Strategy:
   - Use variation (style, spice level, fat type, regional influence)

8. INSTRUCTIONS MUST BE NEATLY FORMATTED AND CAN HAVE MINIMUM LENGTH OF 10 POINTS, YOU CAN EXTEND THE LENGTH AS PER THE RECIPE BUT THE RECIPE NEEDS TO BE DETAILED AND WELL STRUCTURED

Format:
{
  "name": "",
  "description": "",
  "ingredients": [
    { "name": "", "quantity": 0, "unit": "" }
  ],
  "instructions": [],
  "prepTime": 0,
  "cookTime": 0,
  "servings": 0,
  "difficulty": "easy"
}

Input:
Ingredients: ${ingredients}
Cuisine: ${cuisine}
Diet: ${diet}
Servings: ${servings}
Cooking Time: ${cookingTime}
`;

    const text = await generateRecipeText(prompt);

    if (!text || text.trim() === "") {
      throw new Error("Empty AI response");
    }

    let recipe;

    try {
      recipe = safeParse(text);
    } catch (err) {
      console.error("RAW AI:", text);
      return res.status(500).json({
        message: "Invalid AI response format",
      });
    }

    res.json({ recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "AI failed" });
  }
};
