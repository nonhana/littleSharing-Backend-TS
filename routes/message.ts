import express from "express";
import { messageController } from "../controller/message";

const router = express.Router();

router.get("/likelist", messageController.getMessageLikeList);
router.post("/sendlike", messageController.sendMessageLike);

export default router;
