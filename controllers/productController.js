import Product from "../models/productModel.js";

const getImageUrl = (req, filename) =>
  filename ? `${req.protocol}://${req.get("host")}/uploads/${filename}` : null;

export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    const product = new Product({
      name,
      price,
      category,
      description,
      image: req.file ? req.file.filename : null,
    });

    await product.save();

    res.status(201).json({
      success: true,
      product: {
        ...product._doc,
        imageUrl: getImageUrl(req, product.image),
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json(
      products.map((p) => ({
        ...p._doc,
        imageUrl: getImageUrl(req, p.image),
      }))
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      ...product._doc,
      imageUrl: getImageUrl(req, product.image),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    
    if (name) product.name = name;
    if (price) product.price = price;
    if (category) product.category = category;
    if (description) product.description = description;

    if (req.file) product.image = req.file.filename;

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...product._doc,
        imageUrl: getImageUrl(req, product.image),
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed)
      return res.status(400).json({ message: "You already reviewed this product" });

    const review = {
      userId: req.user._id,
      user: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProductReview = async (req, res) => {
  try {
    const { id: productId, reviewId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    review.createdAt = new Date();

    await product.save();

    res.json({ message: "Review updated", review });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const { id: productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId
    );

    await product.save();

    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
