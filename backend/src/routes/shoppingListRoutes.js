import express from "express";
import {
  getShoppingList,
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  generateShoppingList,
} from "../controllers/shoppingListController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getShoppingList);

router.post("/", protect, createShoppingListItem);

router.put("/:id", protect, updateShoppingListItem);

router.delete("/:id", protect, deleteShoppingListItem);

router.post("/generate", protect, generateShoppingList);

export default router;
