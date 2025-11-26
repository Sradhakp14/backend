import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  updateProductReview,
  deleteProductReview,
  getCategories,
} from "../controllers/productController.js";

import { protectUser, protectAdmin, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/categories", getCategories);

router.post("/", protectAdmin, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protectAdmin, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protectAdmin, adminOnly, deleteProduct);

router.get("/", getProducts);

router.get("/:id", getProductById);
router.post("/:id/reviews", protectUser, addProductReview);
router.put("/:id/reviews/:reviewId", protectUser, updateProductReview);
router.delete("/:id/reviews/:reviewId", protectUser, deleteProductReview);

export default router;
