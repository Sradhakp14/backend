import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Items in order
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],

    // Address
    shippingAddress: {
      name: String,
      phone: String,
      fullAddress: String,
      locality: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Payment
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    // Order Status
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Return Requested",
        "Returned",
      ],
      default: "Pending",
    },

    estimatedDelivery: Date,
    deliveredAt: Date,

    // Cancel Order
    cancelledAt: Date,
    cancelReason: String,

    // Return Flow
    returnRequested: { type: Boolean, default: false },
    returnReason: String,
    returnRequestedAt: Date,

    // ADMIN approves return
    returnApproved: { type: Boolean, default: false },
    returnApprovedAt: Date,

    // Refund info
    refundInitiated: { type: Boolean, default: false },
    refundMessage: String,

    returnedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
