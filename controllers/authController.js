import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAddresses = async (req, res) => {
  try {
    const { name, phone, pincode, locality, city, state, fullAddress, index } =
      req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!name || !phone || !pincode || !locality || !city || !state || !fullAddress)
      return res.status(400).json({ message: "All fields are required" });

    const newAddress = { name, phone, pincode, locality, city, state, fullAddress };

    if (index !== undefined && index !== null) {
      user.addresses[index] = newAddress;
    } else {
      user.addresses.push(newAddress);
    }

    await user.save();

    res.json({
      message: index !== null ? "Address updated" : "Address added",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { index } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (index < 0 || index >= user.addresses.length)
      return res.status(400).json({ message: "Invalid address index" });

    user.addresses.splice(index, 1);

    await user.save();

    res.json({
      message: "Address deleted",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { index } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (index < 0 || index >= user.addresses.length)
      return res.status(400).json({ message: "Invalid address index" });

    user.defaultAddressIndex = index;
    await user.save();

    res.json({
      message: "Default address updated",
      defaultIndex: user.defaultAddressIndex,
    });
  } catch (error) {
    console.error("Set default error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
