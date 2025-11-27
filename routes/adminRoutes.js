import express from "express";

import {
  adminLogin,
  getAllUsers,
  deleteUser,
  getUsersCount,
  getProductsCount,
  getOrdersCount,

  
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


router.post("/login", adminLogin);
router.get("/users", protectAdmin, getAllUsers);
router.delete("/users/:id", protectAdmin, deleteUser);
router.get("/users/count", protectAdmin, getUsersCount);


router.get("/orders", protectAdmin, getOrders);
router.get("/orders/count", protectAdmin, getOrdersCount);
router.get("/orders/:id", protectAdmin, getOrderById);
router.put("/orders/:id", protectAdmin, updateOrderStatus);


router.get("/products", protectAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/products/count", protectAdmin, getProductsCount);

router.get("/revenue/daily", protectAdmin, getDailyRevenue);

router.get("/revenue/weekly", protectAdmin, getWeeklyRevenue);

router.get("/revenue/monthly", protectAdmin, getMonthlyRevenue);

router.get("/revenue/yearly", protectAdmin, getYearlyRevenue);

router.get("/revenue/range", protectAdmin, getRangeRevenue);

router.get("/fix-delivered-orders", fixDeliveredOrders);

router.get("/revenue", protectAdmin, getMonthlyRevenue);

export default router;
