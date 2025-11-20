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
} from "../controllers/productController.js";

import {
  protectAdmin,
  adminOnly,
  protectUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protectAdmin, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protectAdmin, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protectAdmin, adminOnly, deleteProduct);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", protectUser, addProductReview);
router.put("/:id/reviews/:reviewId", protectUser, updateProductReview);
router.delete("/:id/reviews/:reviewId", protectUser, deleteProductReview);

export default router;
