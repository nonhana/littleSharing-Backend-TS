import express from "express";
import { commentController } from "../controller/comment";
import { auth } from "../middleware/user.middleware";

const router = express.Router();

router.get("/get-comment-list", auth, commentController.getCommentList);
router.post("/comment-action", auth, commentController.commentAction);
router.get("/comment-like-list", auth, commentController.getCommentLikeList);
router.post("/comment-like-action", auth, commentController.commentLikeAction);

export default router;
