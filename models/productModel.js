import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    price: { type: Number, required: true },

    stock: { type: Number, required: true, default: 10 },

    image: { type: String, default: "" },

    category: { type: String, required: true, trim: true },

    description: { type: String, trim: true, default: "No description" },

    reviews: [reviewSchema],

    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);


productSchema.methods.updateRating = async function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.averageRating = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.averageRating =
      this.reviews.reduce((sum, r) => sum + r.rating, 0) /
      this.reviews.length;
  }

  await this.save();
};

export default mongoose.model("Product", productSchema);
