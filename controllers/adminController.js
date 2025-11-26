import jwt from "jsonwebtoken";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

const ADMIN_EMAIL = "admin@goldmart.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_JWT_SECRET = "superstrongadminsecretkey";

// =====================================================
// ADMIN LOGIN
// =====================================================
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign({ isAdmin: true }, ADMIN_JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// USERS
// =====================================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// COUNTS
// =====================================================
export const getOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// REVENUE — DAILY
// =====================================================
export const getDailyRevenue = async (req, res) => {
  try {
    const { date } = req.query;
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const next = new Date(target);
    next.setDate(next.getDate() + 1);

    const revenue = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          deliveredAt: { $gte: target, $lt: next },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.json({
      date,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// REVENUE — WEEKLY
// =====================================================
export const getWeeklyRevenue = async (req, res) => {
  try {
    const { date } = req.query;
    const target = new Date(date);

    const day = target.getDay(); // 0 = Sunday
    const monday = new Date(target);
    monday.setDate(target.getDate() - ((day + 6) % 7)); // convert Sunday system → Monday system
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const revenue = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          deliveredAt: { $gte: monday, $lte: sunday },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.json({
      weekStart: monday.toISOString().split("T")[0],
      weekEnd: sunday.toISOString().split("T")[0],
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// REVENUE — MONTHLY
// =====================================================
export const getMonthlyRevenue = async (req, res) => {
  try {
    const year = Number(req.query.year);

    const revenue = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          deliveredAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$deliveredAt" } },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const formatted = revenue.map((r) => ({
      month: r._id.month,
      totalRevenue: r.totalRevenue,
    }));

    res.json({ monthlyRevenue: formatted });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// REVENUE — YEARLY
// =====================================================
export const getYearlyRevenue = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      {
        $match: { status: "Delivered" },
      },
      {
        $group: {
          _id: { $year: "$deliveredAt" },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ yearlyRevenue: revenue });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// REVENUE — CUSTOM RANGE
// =====================================================
export const getRangeRevenue = async (req, res) => {
  try {
    const { start, end } = req.query;

    const revenue = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          deliveredAt: { $gte: new Date(start), $lte: new Date(end) },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalRevenue: revenue[0]?.totalRevenue || 0,
      orderCount: revenue[0]?.orderCount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// FIX MISSING deliveredAt
// =====================================================
export const fixDeliveredOrders = async (req, res) => {
  try {
    const updated = await Order.updateMany(
      { status: "Delivered", deliveredAt: null },
      { deliveredAt: new Date() }
    );

    res.json({ updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
