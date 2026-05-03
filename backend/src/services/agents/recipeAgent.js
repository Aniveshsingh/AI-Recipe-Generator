// services/agents/recipeAgent.js

/**
 * RecipeAgent (V1 - Wrapper Only)
 *
 * Purpose:
 * - Acts as orchestration layer (future-ready)
 * - Currently just passes through to existing AI flow
 * - Later we plug: web search, scraper, validation, fallback
 */
import { searchRecipes } from "../web/webSearch.js";

export const recipeAgent = async ({
  buildPrompt,
  generateRecipeText,
  safeParse,
  input,
}) => {
  const {
    mode,
    userPrompt,
    cuisine,
    diet,
    servings,
    cookingTime,
    refineRequest,
    currentRecipe,
  } = input;

  // ❌ Skip web for refine (important)
  const shouldUseWeb = mode !== "refine";
  console.log("Agent received:", { mode, userPrompt });

  // ─────────────────────────────
  // STEP 1: Try Web Search
  // ─────────────────────────────
  if (shouldUseWeb && userPrompt) {
    console.log("Trying web search...");
    const results = await searchRecipes(userPrompt);
    console.log("Web results:", results);

    if (results.length > 0) {
      console.log("Web results found → skipping AI for now");

      // ⚠️ TEMP: returning raw results (we'll refine next step)
      return {
        recipe: {
          name: userPrompt,
          description: "Fetched from web sources (V1)",
          sources: results,
        },
        tokens: 0,
        source: "web",
      };
    }
  }

  // ─────────────────────────────
  // STEP 2: Fallback to AI
  // ─────────────────────────────

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

  const { text, tokens } = await generateRecipeText(prompt);

  if (!text || text.trim() === "") {
    throw new Error("Empty AI response");
  }

  let recipe;
  try {
    recipe = safeParse(text);
  } catch {
    throw new Error("Invalid AI response format");
  }

  recipe = {
    ...recipe,
    prepTime: recipe.prepTime ?? recipe.prep_time ?? 0,
    cookTime: recipe.cookTime ?? recipe.cook_time ?? 0,
  };

  return {
    recipe,
    tokens,
    source: "ai",
  };
};
