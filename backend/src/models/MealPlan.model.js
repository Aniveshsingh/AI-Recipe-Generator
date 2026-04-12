import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  },
  meal_date: {
    type: Date,
    required: true,
  },
  meal_type: {
    type: String,
    enum: ["breakfast", "lunch", "dinner"],
    required: true,
    lowercase: true,
  },
  recipe_name: String,
  prep_time: Number,
  cook_time: Number,
  image_url: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("MealPlan", mealPlanSchema);
