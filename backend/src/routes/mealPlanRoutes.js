import express from "express";
import {
  getMealPlans,
  getUpcomingMealPlans,
  createMealPlan,
  deleteMealPlan,
} from "../controllers/mealPlanController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMealPlans);

router.get("/upcoming", protect, getUpcomingMealPlans);

router.post("/", protect, createMealPlan);

router.delete("/:id", protect, deleteMealPlan);

export default router;
