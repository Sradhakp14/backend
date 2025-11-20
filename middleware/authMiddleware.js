import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("User Auth Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const protectUser = protect;
export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error.message);
    res.status(401).json({ message: "Invalid or expired admin token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};
