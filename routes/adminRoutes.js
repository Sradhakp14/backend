import express from "express";

import {
  adminLogin,
  getAllUsers,
  deleteUser,
  getUsersCount,
  getProductsCount,
  getOrdersCount,

  // Updated Revenue Functions
  getDailyRevenue,
  getWeeklyRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
  getRangeRevenue,

  fixDeliveredOrders,
} from "../controllers/adminController.js";

import {
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import Product from "../models/productModel.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ===============================
// ADMIN LOGIN
// ===============================
router.post("/login", adminLogin);

// ===============================
// USER MANAGEMENT
// ===============================
router.get("/users", protectAdmin, getAllUsers);
router.delete("/users/:id", protectAdmin, deleteUser);
router.get("/users/count", protectAdmin, getUsersCount);

// ===============================
// ORDER MANAGEMENT
// ===============================
router.get("/orders", protectAdmin, getOrders);
router.get("/orders/count", protectAdmin, getOrdersCount);
router.get("/orders/:id", protectAdmin, getOrderById);
router.put("/orders/:id", protectAdmin, updateOrderStatus);

// ===============================
// PRODUCT MANAGEMENT
// ===============================
router.get("/products", protectAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/products/count", protectAdmin, getProductsCount);

// ===============================
// FIXED — REVENUE ROUTES (MATCH FRONTEND)
// ===============================

// DAILY — expects ?date=YYYY-MM-DD
router.get("/revenue/daily", protectAdmin, getDailyRevenue);

// WEEKLY — expects ?date=YYYY-MM-DD
router.get("/revenue/weekly", protectAdmin, getWeeklyRevenue);

// MONTHLY — expects ?year=2025
router.get("/revenue/monthly", protectAdmin, getMonthlyRevenue);

// YEARLY — returns all years { _id: year, totalRevenue }
router.get("/revenue/yearly", protectAdmin, getYearlyRevenue);

// CUSTOM RANGE — expects ?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/revenue/range", protectAdmin, getRangeRevenue);

// Utility route to auto-fix delivered orders missing deliveredAt
router.get("/fix-delivered-orders", fixDeliveredOrders);

// Default revenue endpoint
router.get("/revenue", protectAdmin, getMonthlyRevenue);

export default router;
