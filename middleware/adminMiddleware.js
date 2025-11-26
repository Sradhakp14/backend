import jwt from "jsonwebtoken";

const JWT_SECRET = "superstrongadminsecretkey"; 


export const protectAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No admin token provided" });
    }

    
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Not an admin" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.admin || !req.admin.isAdmin) {
    return res.status(403).json({ message: "Admin access denied" });
  }
  next();
};
