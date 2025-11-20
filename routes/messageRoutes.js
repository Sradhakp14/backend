import express from "express";
import {
  sendMessage,
  getAllMessages,
  updateReadStatus,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", sendMessage);

router.get("/", getAllMessages);

router.put("/:id/read", updateReadStatus);

router.delete("/:id", deleteMessage);

export default router;
