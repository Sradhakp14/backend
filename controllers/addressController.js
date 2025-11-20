import Address from "../models/addressModel.js";

export const addAddress = async (req, res) => {
  try {
    const { name, phone, pincode, locality, city, state, fullAddress } = req.body;

    if (!name || !phone || !pincode || !locality || !city || !state || !fullAddress) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newAddress = await Address.create({
      user: req.user._id,
      name,
      phone,
      pincode,
      locality,
      city,
      state,
      fullAddress,
    });

    res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Server error while adding address" });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Server error while fetching addresses" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({
      message: "Address updated successfully",
      address: updated,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Server error while updating address" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Server error while deleting address" });
  }
};
