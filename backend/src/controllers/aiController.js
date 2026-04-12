export const generateRecipe = async (req, res) => {
  try {
    const { ingredients, cuisine, diet, servings, cookingTime } = req.body;

    const prompt = `
Return ONLY valid JSON.

Create recipe using:
Ingredients: ${ingredients}
Cuisine: ${cuisine}
Diet: ${diet}
Servings: ${servings}
Cooking Time: ${cookingTime}

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
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    console.log(data);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleaned = text.replace(/```json|```/g, "").trim();

    let recipe;

    try {
      recipe = JSON.parse(cleaned);
    } catch (err) {
      console.error("RAW AI:", cleaned);
      return res.status(500).json({ message: "Invalid AI response" });
    }

    res.json({ recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI failed" });
  }
};
