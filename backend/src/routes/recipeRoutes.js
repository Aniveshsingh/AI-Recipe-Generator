import express from "express";
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  saveRecipe,
} from "../controllers/recipeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRecipes);

router.get("/:id", protect, getRecipeById);

router.post("/", protect, createRecipe);
router.post("/save", protect, saveRecipe);

router.put("/:id", protect, updateRecipe);

router.delete("/:id", protect, deleteRecipe);

export default router;
