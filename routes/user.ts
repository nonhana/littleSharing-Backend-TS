import express from "express";
import { userController } from "../controller/user";
import { auth } from "../middleware/user.middleware";

const router = express.Router();

router.post("/register", userController.register);
router.get("/login", userController.login);
router.get("/getuserinfo", auth, userController.getUserInfo);
router.post("/edituserinfo", auth, userController.editUserInfo);
router.get("/getuserlikenum", auth, userController.getUserLikeNum);
router.get("/getusercollectionnum", auth, userController.getUserCollectionNum);
router.get("/getlikedarticles", auth, userController.getLikedArticles);
router.get("/getcollectedarticles", auth, userController.getCollectedArticles);
router.post("/focususeractions", auth, userController.focusUserActions);
router.get("/getuserfocuslist", auth, userController.getUserFocusList);
router.get("/getuserfanslist", auth, userController.getUserFansList);
router.get("/getuserarticletags", auth, userController.getUserArticleTags);

export default router;
