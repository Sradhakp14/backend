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

import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protectUser, getUserProfile);

router.put("/update-profile", protectUser, updateProfile);
router.post("/update-addresses", protectUser, updateAddresses);
router.post("/set-default-address", protectUser, setDefaultAddress);
router.delete("/delete-address", protectUser, deleteAddress);

export default router;
