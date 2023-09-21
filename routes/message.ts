import express from "express";
import { messageController } from "../controller/message";

const router = express.Router();

router.post("/send-like", messageController.sendMessageLike);
router.get("/get-like-list", messageController.getMessageLikeList);

export default router;
