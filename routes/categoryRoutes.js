import express from "express";
import { getCategories, addCategory } from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, admin, addCategory);

export default router;
