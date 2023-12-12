import express from "express";
import { basic } from "../controller/message/basic";
import { actions } from "../controller/message/actions";
import { otherData } from "../controller/message/otherData";
import { auth } from "../middleware/user.middleware";

const router = express.Router();

router.post("/post", auth, basic.postMessage); // 发送消息
router.get("/get", auth, basic.getMessage); // 获取消息
router.post("/delete", auth, basic.deleteMessage); // 删除消息
router.get("/unread", auth, otherData.getUnreadMessageCount); // 获取所有类型的未读消息的数量
router.post("/read", auth, actions.readMessage); // 更改指定类型的所有未读消息为已读

export default router;
