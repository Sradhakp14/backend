import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  cancelOrder,
  generateInvoice,
  requestReturn,
  approveReturn
} from "../controllers/orderController.js";

import Order from "../models/orderModel.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();


// ================= USER ROUTES =================

// Create order
router.post("/", protect, createOrder);

// User order history
router.get("/myorders", protect, getMyOrders);

// User cancel order
router.put("/:id/cancel", protect, cancelOrder);

// User requests return
router.put("/:id/return", protect, requestReturn);

// Generate invoice
router.get("/:id/invoice", protect, generateInvoice);


// ================= ADMIN ROUTES =================

// MUST BE BEFORE /:id  or it will match wrong!
router.get("/count", protectAdmin, async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders
router.get("/", protectAdmin, getOrders);

// Get order by ID
router.get("/:id", protectAdmin, getOrderById);


// ================= FIXED ORDER FLOW =================

// Admin approves return → MUST COME BEFORE "/:id"
router.put("/:id/return/approve", protectAdmin, approveReturn);

// Update order status (Processing, Shipped, Delivered)
router.put("/:id", protectAdmin, updateOrderStatus);

export default router;
