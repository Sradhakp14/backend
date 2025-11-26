import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import path from "path";
import fs from "fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      image: req.file ? req.file.filename : "",
    });

    await product.save();
    res.status(201).json({
      message: "Product created",
      product: {
        ...product.toObject(),
        imageUrl: product.image
          ? `${BASE_URL}/uploads/${product.image}`
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const formatted = products.map((p) => ({
      ...p.toObject(),
      imageUrl: p.image ? `${BASE_URL}/uploads/${p.image}` : null,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      ...product.toObject(),
      imageUrl: product.image
        ? `${BASE_URL}/uploads/${product.image}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({
      message: "Updated",
      product: {
        ...product.toObject(),
        imageUrl: product.image
          ? `${BASE_URL}/uploads/${product.image}`
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    if (p.image) {
      const imgPath = path.join(process.cwd(), "uploads", p.image);

      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.reviews.push({
      userId: req.user._id,
      user: req.user.name,
      rating,
      comment,
    });

    await product.updateRating();

    res.json({ message: "Review added", reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;

    await product.updateRating();

    res.json({ message: "Review updated", reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.deleteOne();
    await product.updateRating();

    res.json({ message: "Review deleted", reviews: product.reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
