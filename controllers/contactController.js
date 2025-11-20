import Contact from "../models/contactModel.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    res.status(201).json({ message: "Message sent successfully", contact });
  } catch (error) {
    console.error("Contact Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Get Contacts Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
