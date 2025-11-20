import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  updateAddresses,
  setDefaultAddress,
  deleteAddress
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

router.put("/update-profile", protect, updateProfile);
router.post("/update-addresses", protect, updateAddresses);
router.post("/set-default-address", protect, setDefaultAddress);
router.delete("/delete-address", protect, deleteAddress);

export default router;
