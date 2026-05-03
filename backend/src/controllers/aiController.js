import crypto from "crypto";
import GeneratedRecipe from "../models/GeneratedRecipe.model.js";
// import AnonUsage from "../models/AnonUsage.model.js";
import { recipeAgent } from "../services/agents/recipeAgent.js";

const TOKENS_PER_CREDIT = 30;
const DAILY_CREDITS = 100;
// const ANON_FREE_GENS = 1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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

  return {
    text: data.choices[0].message.content,
    tokens: data.usage?.completion_tokens || 0,
  };
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
  return {
    text: text.replace(/```json|```/g, "").trim(),
    tokens: data.usageMetadata?.candidatesTokenCount || 0,
  };
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

const normalizeForHash = (s) =>
  (s || "").toString().toLowerCase().trim().replace(/\s+/g, " ");

const computePromptHash = ({
  mode,
  userPrompt,
  cuisine,
  diet,
  servings,
  cookingTime,
}) => {
  const str = [
    mode || "",
    normalizeForHash(userPrompt),
    normalizeForHash(cuisine),
    normalizeForHash(diet),
    servings ?? "",
    normalizeForHash(cookingTime),
  ].join("|");
  return crypto.createHash("sha256").update(str).digest("hex");
};

// const getClientIp = (req) => {
//   const fwd = req.headers["x-forwarded-for"];
//   if (fwd) return fwd.split(",")[0].trim();
//   return req.ip || req.socket?.remoteAddress || "unknown";
// };

export const ensureUserCredits = async (user) => {
  const now = new Date();
  const last = user.creditsResetAt ? new Date(user.creditsResetAt) : null;
  if (!last || now - last >= ONE_DAY_MS) {
    user.credits = DAILY_CREDITS;
    user.creditsResetAt = now;
    await user.save();
  }
};

// const incrementAnonUsage = async (ip) => {
//   const now = new Date();
//   let usage = await AnonUsage.findOne({ ip });
//   if (!usage) {
//     usage = await AnonUsage.create({
//       ip,
//       genCount: 1,
//       resetAt: new Date(now.getTime() + ONE_DAY_MS),
//     });
//     return usage;
//   }
//   if (usage.resetAt < now) {
//     usage.genCount = 1;
//     usage.resetAt = new Date(now.getTime() + ONE_DAY_MS);
//   } else {
//     usage.genCount += 1;
//   }
//   await usage.save();
//   return usage;
// };

const cleanJSON = (text) => {
  let cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
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

// ─────────────────────────────────────────────
// PROMPT BUILDER — adapts based on mode
// ─────────────────────────────────────────────
const buildPrompt = ({
  mode,
  userPrompt,
  cuisine,
  diet,
  servings,
  cookingTime,
  refineRequest,
  currentRecipe,
}) => {
  const outputFormat = `
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
  "difficulty": "easy",
  "chefNote": ""
}`;

  const strictRules = `
STRICT RULES:
1. Output must start with { and end with }
2. Do NOT include backticks, markdown, or comments
3. "instructions" must be an array of strings (minimum 8 steps, detailed)
4. "chefNote" must be a short insider tip (1-2 sentences)
5. Include exact measurements (grams, ml, tsp etc.)
6. Every instruction step must include heat level and visual doneness cue
7. If you reach token limit, prioritize completing valid JSON structure over adding more details.`;

  const detailRules = `
COOKING INTELLIGENCE RULES (MUST FOLLOW):
- Exact ingredient measurements
- Cooking technique cues (oil separation, sauce thickening etc.)
- Doneness signals (visual, aroma, texture — not just time)
- Recovery fixes if something goes wrong
- Flavor balancing tips
- Heat control explanation at each step
- When to stir, cover/uncover, add each ingredient`;

  // ── MODE: REFINE ──
  if (mode === "refine") {
    return `
Return ONLY valid JSON. No markdown. No explanation.

You are a master chef. The user wants to REFINE an existing recipe.

Current Recipe:
${JSON.stringify(currentRecipe, null, 2)}

User's Refinement Request: "${refineRequest}"

Apply the user's changes intelligently. Keep what's good, improve what they asked.
Filters: Cuisine: ${cuisine}, Diet: ${diet}, Servings: ${servings}

${strictRules}
${detailRules}

Format:
${outputFormat}
`;
  }

  // ── MODE: DISH NAME ──
  if (mode === "dish") {
    return `
Return ONLY valid JSON. No markdown. No explanation.

You are a master chef. Generate a detailed, restaurant-grade recipe for: "${userPrompt}"

Filters:
- Cuisine: ${cuisine || "Any"}
- Diet: ${diet || "No restrictions"}
- Servings: ${servings || 4}
- Cooking Time: ${cookingTime || "Any"}

${strictRules}
${detailRules}

UNIQUENESS RULES:
- Use unique spice ratios and cooking techniques
- Add a personal twist that makes this version special
- Never generate a generic/textbook version

Format:
${outputFormat}
`;
  }

  // ── MODE: VIBE / MOOD / COMFORT ──
  if (mode === "vibe") {
    return `
Return ONLY valid JSON. No markdown. No explanation.

You are a master chef with deep emotional intelligence about food.
The user described a vibe/mood/feeling: "${userPrompt}"

Interpret this creatively and generate the PERFECT recipe that matches this energy.
Think about: texture, warmth, flavor intensity, occasion, emotions.

Filters:
- Cuisine: ${cuisine || "Any — pick the most fitting"}
- Diet: ${diet || "No restrictions"}
- Servings: ${servings || 2}
- Cooking Time: ${cookingTime || "Whatever fits the vibe"}

${strictRules}
${detailRules}

IMPORTANT: The recipe name and description must directly reflect the vibe/mood.
The dish should FEEL like what the user described.

Format:
${outputFormat}
`;
  }

  // ── MODE: INGREDIENTS ──
  if (mode === "ingredients") {
    return `
Return ONLY valid JSON. No markdown. No explanation.

You are a master chef. Generate a creative recipe using these ingredients: ${userPrompt}

Filters:
- Cuisine: ${cuisine || "Any"}
- Diet: ${diet || "No restrictions"}
- Servings: ${servings || 4}
- Cooking Time: ${cookingTime || "Any"}

${strictRules}
${detailRules}

UNIQUENESS RULES:
- Modify spice ratios and techniques to make it unique
- Avoid generic/textbook versions
- Create a variation with regional or personal influence

Format:
${outputFormat}
`;
  }

  // ── MODE: PANTRY ──
  if (mode === "pantry") {
    return `
Return ONLY valid JSON. No markdown. No explanation.

You are a creative chef who specializes in making amazing food from what's available.
Generate a great recipe using pantry/available ingredients.

Filters:
- Cuisine: ${cuisine || "Any"}
- Diet: ${diet || "No restrictions"}
- Servings: ${servings || 4}
- Cooking Time: ${cookingTime || "Any"}

${strictRules}
${detailRules}

Format:
${outputFormat}
`;
  }

  // ── FALLBACK (treat as vibe/general) ──
  return `
Return ONLY valid JSON. No markdown. No explanation.

You are a master chef. The user said: "${userPrompt}"
Generate the most fitting restaurant-grade recipe for this request.

Filters:
- Cuisine: ${cuisine || "Any"}
- Diet: ${diet || "No restrictions"}
- Servings: ${servings || 4}
- Cooking Time: ${cookingTime || "Any"}

${strictRules}
${detailRules}

Format:
${outputFormat}
`;
};

// ─────────────────────────────────────────────
// MAIN CONTROLLER
// ─────────────────────────────────────────────
export const generateRecipe = async (req, res) => {
  try {
    const {
      mode = "vibe", // dish | vibe | ingredients | pantry | refine
      userPrompt,
      cuisine,
      diet,
      servings,
      cookingTime,
      refineRequest,
      currentRecipe,
      bypassCache = false,
    } = req.body;

    const isRefine = mode === "refine";
    const isAuthed = !!req.user;
    if (!isAuthed) {
      return res.status(401).json({
        message: "Please login to generate recipes",
        requiresAuth: true,
      });
    }
    // Refine and explicit regenerate require a signed-in user
    // if ((isRefine || bypassCache) && !isAuthed) {
    //   return res.status(401).json({
    //     message: isRefine
    //       ? "Sign up to refine recipes"
    //       : "Sign up to regenerate recipes",
    //     requiresAuth: true,
    //   });
    // }
    if (!isAuthed) {
      return res.status(401).json({
        message: "Please login to use this feature",
        requiresAuth: true,
      });
    }
    // Anon users: enforce free-gen quota
    // let anonIp = null;
    // if (!isAuthed) {
    //   anonIp = getClientIp(req);
    //   const existing = await AnonUsage.findOne({ ip: anonIp });
    //   const now = new Date();
    //   const quotaActive = existing && existing.resetAt > now;
    //   if (quotaActive && existing.genCount >= ANON_FREE_GENS) {
    //     return res.status(401).json({
    //       message: "Sign up for more recipes — free limit reached",
    //       requiresAuth: true,
    //     });
    //   }
    // }

    // Signed users: reset daily credits + check balance
    if (isAuthed) {
      await ensureUserCredits(req.user);
      if (req.user.credits <= 0) {
        return res.status(402).json({
          message: "Daily credits exhausted. Resets every 24 hours.",
          credits: 0,
          creditsResetAt: req.user.creditsResetAt,
        });
      }
    }

    // Cache lookup — skip for refine (carries large unique payload) and explicit bypass
    let promptHash = null;
    if (!isRefine && !bypassCache) {
      promptHash = computePromptHash({
        mode,
        userPrompt,
        cuisine,
        diet,
        servings,
        cookingTime,
      });
      const cached = await GeneratedRecipe.findOne({ promptHash });
      if (cached) {
        cached.hitCount += 1;
        await cached.save();

        // if (!isAuthed && anonIp) {
        //   await incrementAnonUsage(anonIp);
        // }

        return res.json({
          recipe: cached.recipe,
          cached: true,
          credits: isAuthed ? req.user.credits : undefined,
        });
      }
    }

    // Cache miss → call AI
    const prompt = buildPrompt({
      mode,
      userPrompt,
      cuisine,
      diet,
      servings,
      cookingTime,
      refineRequest,
      currentRecipe,
    });

    const { recipe, tokens } = await recipeAgent({
      buildPrompt,
      generateRecipeText,
      safeParse,
      input: {
        mode,
        userPrompt,
        cuisine,
        diet,
        servings,
        cookingTime,
        refineRequest,
        currentRecipe,
      },
    });

    // Deduct credits based on completion tokens
    if (isAuthed) {
      const creditsUsed = Math.max(
        1,
        Math.ceil((tokens || 0) / TOKENS_PER_CREDIT),
      );
      req.user.credits = Math.max(0, req.user.credits - creditsUsed);
      await req.user.save();
    }

    // Persist to cache (fresh, non-refine generations only)
    if (!isRefine && !bypassCache && promptHash) {
      try {
        await GeneratedRecipe.create({
          promptHash,
          mode,
          userPrompt,
          filters: { cuisine, diet, servings, cookingTime },
          recipe,
          tokensUsed: tokens,
        });
      } catch (err) {
        // Duplicate key from concurrent request — safe to ignore
        if (err?.code !== 11000)
          console.error("cache save failed", err.message);
      }
    }

    if (!isAuthed && anonIp) {
      await incrementAnonUsage(anonIp);
    }

    res.json({
      recipe,

      cached: false,
      credits: isAuthed ? req.user.credits : undefined,
      tokensUsed: tokens,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "AI failed" });
  }
};

// ── IMPORT FROM URL ──────────────────────────
export const importRecipeFromURL = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    let pageText = "";
    try {
      const pageRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; RecipeBot/1.0)",
          Accept: "text/html",
        },
      });
      const html = await pageRes.text();
      pageText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);
    } catch {
      return res.status(400).json({
        message:
          "Could not fetch this URL. Make sure it's a public recipe page.",
      });
    }

    const prompt = `
Return ONLY valid JSON. No markdown. No explanation.
 If you reach token limit, prioritize completing valid JSON structure over adding more details.
Extract the recipe from this webpage content. If it's not a recipe, return: { "error": "Not a recipe page" }
 
Format:
{
  "name": "",
  "description": "",
  "ingredients": [{ "name": "", "quantity": 0, "unit": "" }],
  "instructions": [],
  "prepTime": 0,
  "cookTime": 0,
  "servings": 0,
  "difficulty": "medium",
  "cuisine_type": "",
  "meal_type": "",
  "chefNote": ""
}
 
Webpage content:
${pageText}
`;

    const { text } = await generateRecipeText(prompt);
    if (!text?.trim()) throw new Error("Empty AI response");

    let recipe;
    try {
      recipe = safeParse(text);
    } catch {
      return res
        .status(500)
        .json({ message: "Could not extract recipe from this page" });
    }

    if (recipe.error) return res.status(400).json({ message: recipe.error });

    recipe = {
      ...recipe,
      prepTime: recipe.prepTime ?? recipe.prep_time ?? 0,
      cookTime: recipe.cookTime ?? recipe.cook_time ?? 0,
      chefNote: recipe.chefNote || recipe.chef_note || "",
    };

    res.json({ recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Import failed" });
  }
};

// ── COOKING TIP ──────────────────────────────
export const getCookingTip = async (req, res) => {
  try {
    const { recipeName, step, stepNumber, totalSteps } = req.body;

    const prompt = `
You are a professional chef giving a cooking tip for one specific step.
 
Recipe: ${recipeName}
Current Step (${stepNumber}/${totalSteps}): "${step}"
 
Give a SHORT, practical tip (2-4 sentences) covering:
- What visual/aroma/texture cue to look for
- The most common mistake at this step and how to avoid it
- Why this step matters for the final dish
 
Return ONLY the tip text. No JSON. No labels. Just the tip.
`;

    const { text } = await generateRecipeText(prompt);
    res.json({
      tip:
        text?.trim() ||
        "Focus on visual cues — color, aroma, and texture tell you more than a timer.",
    });
  } catch (error) {
    console.error(error);
    res.json({
      tip: "Take your time with this step — precision here makes the whole dish shine.",
    });
  }
};
