import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  cancelOrder,
  requestReturn,
  markReturnPickedUp,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin, adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return-request", protect, requestReturn);
router.get("/", protectAdmin, adminOnly, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protectAdmin, adminOnly, updateOrderStatus);
router.put("/:id/return/pickup", protectAdmin, adminOnly, markReturnPickedUp);

export default router;
