import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },
    pincode: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/,
    },
    locality: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);
export default Address;
