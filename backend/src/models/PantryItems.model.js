import mongoose from "mongoose";

const pantryItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  name: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  unit: {
    type: String,
    required: true,
  },

  category: {
    type: String,
  },

  expiry_date: {
    type: Date,
  },

  is_running_low: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PantryItem", pantryItemSchema);
