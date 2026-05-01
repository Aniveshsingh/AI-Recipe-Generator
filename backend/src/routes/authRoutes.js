import express from "express";
import { login, signup, googleAuth } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { ensureUserCredits } from "../controllers/aiController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, async (req, res) => {
  await ensureUserCredits(req.user);

  res.json({ user: req.user });
});
router.post("/google", googleAuth);

export default router;
