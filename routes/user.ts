import express from "express";
const router = express.Router();
import userHandler from "../controller/user";

router.post("/register", userHandler.regUser);
router.get("/login", userHandler.login);
router.get("/userinfo", userHandler.getUserInfo);
router.post("/edituserinfo", userHandler.editUserInfo);
router.get("/getlikenum", userHandler.getUserLikeNum);
router.get("/getcollectionnum", userHandler.getUserCollectionNum);
router.get("/getlikedarticles", userHandler.getUserAddLike);
router.get("/getcollectedarticles", userHandler.getUserAddCollection);
router.post("/focususeractions", userHandler.focusUserActions);
router.get("/getuserfocuslist", userHandler.getUserFocusList);
router.get("/getuserfanslist", userHandler.getUserFansList);
router.get("/getuserarticletags", userHandler.getUserArticleTags);

export default router;
