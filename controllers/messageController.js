import Message from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const newMessage = await Message.create({
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message saved successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const updated = await Message.findByIdAndUpdate(
      id,
      { isRead },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    res.status(200).json({
      success: true,
      message: "Read status updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Message.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
