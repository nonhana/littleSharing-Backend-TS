import express from "express";
// import { messageController } from "../controller/message";
import { likeMessage } from "../controller/message/likeMessage";

const router = express.Router();

router.post("/send-like", likeMessage.sendMessageLike);
router.get("/get-like-list", likeMessage.getMessageLikeList);

export default router;
