import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
});

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  fiber: Number,
});

const recipeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  name: {
    type: String,
    required: true,
  },

  description: String,
  cuisine_type: String,
  difficulty: String,
  prep_time: Number,
  cook_time: Number,
  servings: Number,
  instructions: [String],
  dietary_tags: [String],
  user_notes: String,
  image_url: String,
  source_url: String,
  ingredients: [ingredientSchema],
  nutrition: nutritionSchema,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Recipe", recipeSchema);
