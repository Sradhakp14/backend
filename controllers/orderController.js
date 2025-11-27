import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import PDFDocument from "pdfkit";


export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    if (!shippingAddress || !shippingAddress.name) {
      return res.status(400).json({ message: "Shipping address missing" });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Delivered")
      return res
        .status(400)
        .json({ message: "Cannot cancel delivered order" });

    order.status = "Cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res.json({ message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Delivered") {
      return res.status(400).json({
        message: "Return allowed only after delivery",
      });
    }

    order.returnRequested = true;
    order.returnReason = reason;
    order.returnRequestedAt = new Date();
    order.status = "Return Requested";

    await order.save();

    res.json({ message: "Return requested", order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const approveReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.returnApproved = true;
    order.returnApprovedAt = new Date();
    order.status = "Returned";

    await order.save();

    res.json({ message: "Return approved", order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;

    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );

    doc.text(`Invoice ID: ${order._id}`);
    doc.text(`Customer: ${order.user.name}`);
    doc.text(`Total: ₹${order.totalPrice}`);

    order.orderItems.forEach((item) => {
      doc.text(`${item.name} x ${item.qty} = ₹${item.price * item.qty}`);
    });

    doc.end();
    doc.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
