import mongoose from "mongoose";

const shoppingListItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  ingredient_name: {
    type: String,
    required: true,
  },

  quantity: Number,

  unit: String,

  category: String,

  is_checked: {
    type: Boolean,
    default: false,
  },

  from_meal_plan: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ShoppingListItem", shoppingListItemSchema);
