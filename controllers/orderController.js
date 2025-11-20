import Order from "../models/orderModel.js";

const autoUpdateStatus = async (orderId) => {
  const statusFlow = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered"];
  let index = 0;

  const interval = setInterval(async () => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        clearInterval(interval);
        return;
      }

      if (["Delivered", "Cancelled", "Returned"].includes(order.status)) {
        clearInterval(interval);
        return;
      }

      if (index >= statusFlow.length) {
        clearInterval(interval);
        return;
      }

      order.status = statusFlow[index];

      if (statusFlow[index] === "Delivered") {
        order.deliveredAt = new Date();
        order.estimatedDelivery = null;
      }

      await order.save();
      index++;
    } catch (err) {
      console.log("Auto update failed:", err);
      clearInterval(interval);
    }
  }, 60 * 1000);
};

const autoApproveReturn = async (orderId) => {
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      if (!order) return;
      if (!order.returnRequested) return;
      if (order.returnApproved) return;

      order.returnApproved = true;
      order.returnApprovedAt = new Date();
      await order.save();
      console.log("Auto return approved for order:", orderId);
    } catch (err) {
      console.log("Auto return approval failed:", err);
    }
  }, 60 * 1000); 
};

export const createOrder = async (req, res) => {
  try {
    const { orderItems, items, totalPrice, shippingAddress, paymentMethod } = req.body;
    const raw = Array.isArray(orderItems) ? orderItems : Array.isArray(items) ? items : [];

    if (!raw.length) return res.status(400).json({ message: "No order items" });

    const mapped = raw.map((it) => ({
      name: it.name,
      qty: it.qty || it.quantity || 1,
      price: it.price || 0,
      image: it.image?.url || it.image || "",
    }));

    const estimated = new Date();
    estimated.setDate(estimated.getDate() + 5);

    const newOrder = await Order.create({
      user: req.user._id,
      orderItems: mapped,
      shippingAddress,
      totalPrice,
      paymentMethod: paymentMethod || "Cash on Delivery",
      estimatedDelivery: estimated,
    });

    autoUpdateStatus(newOrder._id);

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Get My Orders Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    console.error("Get OrderById Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = new Date();
      order.estimatedDelivery = null;
    }

    if (req.body.status === "Cancelled") {
      order.cancelledAt = new Date();
      order.cancelReason = req.body.cancelReason || null;
      order.estimatedDelivery = null;
    }

    if (req.body.status === "Returned") {
      order.returnPickupDone = true;
      order.returnPickupAt = new Date();
      order.returnApproved = true;
      order.returnApprovedAt = order.returnApprovedAt || new Date();
      order.returnedAt = new Date();
    }

    await order.save();
    res.json({ success: true, message: "Status updated", order });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Delivered") return res.status(400).json({ message: "Delivered orders cannot be cancelled" });
    if (order.status === "Cancelled") return res.status(400).json({ message: "Order already cancelled" });

    order.status = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || null;
    order.estimatedDelivery = null;

    await order.save();
    res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Delivered") return res.status(400).json({ message: "Only delivered orders can be returned" });
    if (!order.deliveredAt) return res.status(400).json({ message: "Delivered time not recorded" });

    const deliveredAt = new Date(order.deliveredAt);
    const diffDays = (new Date() - deliveredAt) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) return res.status(400).json({ message: "Return window expired" });

    order.returnRequested = true;
    order.returnReason = req.body.reason || null;
    order.returnRequestedAt = new Date();
    
    order.returnApproved = false;

    await order.save();

    autoApproveReturn(order._id);

    res.json({ success: true, message: "Return requested", order });
  } catch (err) {
    console.error("Request Return Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const markReturnPickedUp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.returnRequested) return res.status(400).json({ message: "No return requested" });

    order.returnPickupDone = true;
    order.returnPickupAt = new Date();
    order.returnApproved = true;
    order.returnApprovedAt = order.returnApprovedAt || new Date();

    order.status = "Returned";
    order.returnedAt = new Date();

    order.refundInitiated = true;
    order.refundMessage = "Refund initiated after pickup.";

    await order.save();
    res.json({ success: true, message: "Return pickup completed", order });
  } catch (err) {
    console.error("Mark return pickup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
