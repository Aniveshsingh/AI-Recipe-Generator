import express from "express";
import { generateRecipe } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", generateRecipe);

export default router;
