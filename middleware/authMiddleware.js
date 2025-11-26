import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const ADMIN_JWT_SECRET = "superstrongadminsecretkey";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "AUTH ERROR: Token missing" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "AUTH ERROR: Invalid or malformed user token" });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "AUTH ERROR: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("User Auth Error:", error.message);
    res.status(500).json({ message: "AUTH ERROR: Internal server error" });
  }
};

export const protectUser = protect;


export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "ADMIN AUTH ERROR: Token missing" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "ADMIN AUTH ERROR: Invalid or malformed admin token" });
    }

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "ADMIN AUTH ERROR: Not an admin user" });
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: "admin",
    };

    next();
  } catch (error) {
    console.error("Admin Auth Error:", error.message);
    res.status(500).json({ message: "ADMIN AUTH ERROR: Internal server error" });
  }
};


export const adminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: "ADMIN AUTH ERROR: Access denied" });
  }
  next();
};
