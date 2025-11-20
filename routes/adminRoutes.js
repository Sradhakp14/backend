import express from "express";
import {
  adminLogin,
  getAdminData,
  getAllUsers,
  deleteUser,
  getAllOrders,
} from "../controllers/adminController.js";

import {
  updateOrderStatus,
} from "../controllers/orderController.js";

import Product from "../models/productModel.js";
import { protectAdmin, adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.post("/login", adminLogin);

router.get("/profile", protectAdmin, adminOnly, getAdminData);

router.get("/users", protectAdmin, adminOnly, getAllUsers);
router.delete("/user/:id", protectAdmin, adminOnly, deleteUser);


router.get("/orders", protectAdmin, adminOnly, getAllOrders);
router.put("/orders/:id", protectAdmin, adminOnly, updateOrderStatus);

router.get("/products", protectAdmin, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
