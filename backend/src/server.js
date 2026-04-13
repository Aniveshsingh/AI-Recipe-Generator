import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import pantryRoutes from "./routes/pantryRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import shoppingListRoutes from "./routes/shoppingListRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "https://ai-recipe-generator-ltx9qu7m7-aniveshsingh1242-3035s-projects.vercel.app",
      "https://ai-recipe-generator-mu-rouge.vercel.app",
      "https://ai-mealmatrix.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("AI Recipe Generator Backend Running");
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// routes middleware
app.use("/recipes", recipeRoutes);
app.use("/pantry", pantryRoutes);
app.use("/mealPlan", mealPlanRoutes);
app.use("/shoppingList", shoppingListRoutes);
app.use("/stats", statsRoutes);
app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
