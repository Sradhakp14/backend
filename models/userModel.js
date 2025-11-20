import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true },
  },
  { _id: false } 
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    addresses: [addressSchema],
    defaultAddressIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.virtual("defaultAddress").get(function () {
  return this.addresses?.[this.defaultAddressIndex] || null;
});

const User = mongoose.model("User", userSchema);
export default User;
