import express from "express";

import { optionalAuth } from "../middleware/authMiddleware.js";

import {
  generateRecipe,
  importRecipeFromURL,
  getCookingTip,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate", generateRecipe);
router.post("/import-url", importRecipeFromURL);
router.post("/cooking-tip", getCookingTip);

export default router;
