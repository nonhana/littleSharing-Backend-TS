import express from "express";
import { basic } from "../controller/comment/basic";
import { otherData } from "../controller/comment/otherData";
import { actions } from "../controller/comment/actions";
import { auth } from "../middleware/user.middleware";

const router = express.Router();

router.get("/get-comment-list", auth, basic.getCommentList);
router.post("/comment-action", auth, basic.commentAction);
router.get("/comment-like-list", auth, otherData.getCommentLikeList);
router.post("/comment-like-action", auth, actions.commentLikeAction);

export default router;
