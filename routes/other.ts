import express from "express";
const router = express.Router();
import otherController from "../controller/other";

router.post("/uploadimg", otherController.uploadImg);
router.post("/deleteimg", otherController.deleteImg);
router.post("/likeaction", otherController.addLike);
router.get("/userlikelist", otherController.getUserLikeList);
router.post("/collectaction", otherController.addCollect);
router.get("/usercollectlist", otherController.getUserCollectList);
router.get("/commentlist", otherController.getCommentList);
router.post("/commentaction", otherController.commentAction);
router.post("/commentlikeaction", otherController.commentLikeAction);
router.get("/commentlikelist", otherController.getCommentLikeList);

export default router;
