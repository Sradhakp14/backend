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

router.post("/", protect, createOrder);

router.get("/myorders", protect, getMyOrders);

router.put("/:id/cancel", protect, cancelOrder);

router.put("/:id/return", protect, requestReturn);

router.get("/:id/invoice", protect, generateInvoice);

router.get("/count", protectAdmin, async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/", protectAdmin, getOrders);

router.get("/:id", protectAdmin, getOrderById);

router.put("/:id/return/approve", protectAdmin, approveReturn);

router.put("/:id", protectAdmin, updateOrderStatus);

export default router;
