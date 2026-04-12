import express from "express";
import {
  getPantry,
  getPantryById,
  createPantry,
  updatePantry,
  deletePantryItem,
} from "../controllers/pantryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getPantry);
router.get("/:id", protect, getPantryById);
router.post("/", protect, createPantry);
router.put("/:id", protect, updatePantry);
router.delete("/:id", protect, deletePantryItem);

export default router;
