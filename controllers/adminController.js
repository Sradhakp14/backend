import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateAdminToken = (id) => {
  return jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateAdminToken(admin._id),
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    res.json({ success: true, orders, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminData = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
