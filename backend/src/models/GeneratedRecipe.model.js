import mongoose from "mongoose";

const generatedRecipeSchema = new mongoose.Schema({
  promptHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  mode: String,
  userPrompt: String,
  filters: {
    cuisine: String,
    diet: String,
    servings: Number,
    cookingTime: String,
  },
  recipe: mongoose.Schema.Types.Mixed,
  hitCount: {
    type: Number,
    default: 0,
  },
  tokensUsed: Number,
  image: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30,
  },
});

export default mongoose.model("GeneratedRecipe", generatedRecipeSchema);
