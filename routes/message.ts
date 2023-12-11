import express from "express";
import { basic } from "../controller/message/basic";
import { auth } from "../middleware/user.middleware";

const router = express.Router();

router.post("/post", auth, basic.postMessage); // 发送消息
router.get("/get", auth, basic.getMessage); // 获取消息
router.post("/delete", auth, basic.deleteMessage); // 删除消息

export default router;
