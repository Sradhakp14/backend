import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],

    shippingAddress: {
      name: String,
      phone: String,
      fullAddress: String,
      locality: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentMethod: {
      type: String,
      required: true,
      default: "Cash on Delivery",
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    returnRequested: {
      type: Boolean,
      default: false,
    },
    returnReason: {
      type: String,
      default: null,
    },
    returnRequestedAt: {
      type: Date,
      default: null,
    },

    returnApproved: {
      type: Boolean,
      default: false,
    },
    returnApprovedAt: {
      type: Date,
      default: null,
    },

    returnPickupDone: {
      type: Boolean,
      default: false,
    },
    returnPickupAt: {
      type: Date,
      default: null,
    },

    refundInitiated: {
      type: Boolean,
      default: false,
    },
    refundMessage: {
      type: String,
      default: null,
    },

    returnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
