import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

const router = express.Router();

router.post("/", protect, addAddress);

router.get("/", protect, getUserAddresses);

router.put("/:id", protect, updateAddress);

router.delete("/:id", protect, deleteAddress);

export default router;
