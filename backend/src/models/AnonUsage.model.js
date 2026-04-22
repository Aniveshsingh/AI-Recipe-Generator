import mongoose from "mongoose";

const anonUsageSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  genCount: {
    type: Number,
    default: 0,
  },
  resetAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7,
  },
});

export default mongoose.model("AnonUsage", anonUsageSchema);
