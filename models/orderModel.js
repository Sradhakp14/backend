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
        "Return Requested",
        "Returned",
      ],
      default: "Pending",
    },

    estimatedDelivery: Date,
    deliveredAt: Date,

    
    cancelledAt: Date,
    cancelReason: String,

    
    returnRequested: { type: Boolean, default: false },
    returnReason: String,
    returnRequestedAt: Date,

    
    returnApproved: { type: Boolean, default: false },
    returnApprovedAt: Date,

    
    refundInitiated: { type: Boolean, default: false },
    refundMessage: String,

    returnedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
