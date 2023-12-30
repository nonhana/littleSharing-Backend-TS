import express from "express";
import { basic } from "../controller/comment/basic";
import { otherData } from "../controller/comment/otherData";
import { actions } from "../controller/comment/actions";
import { auth } from "../middleware/user.middleware";

const router = express.Router();

router.get("/get-comment-list", basic.getCommentList); // 获取评论列表（无需token）
router.post("/comment-action", auth, basic.commentAction); // 评论的处理函数，包括评论与删除评论
router.get("/comment-like-list", auth, otherData.getCommentLikeList); // 获取用户点赞的评论列表
router.post("/comment-like-action", auth, actions.commentLikeAction); // 用户点赞评论的处理函数

export default router;
