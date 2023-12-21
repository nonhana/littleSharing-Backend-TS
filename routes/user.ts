import express from "express";
import {
  avatarUpload,
  backgroundUpload,
} from "../middleware/upload.middleware";
import { actions } from "../controller/user/actions";
import { basic } from "../controller/user/basic";
import { otherData } from "../controller/user/otherData";
import { auth } from "../middleware/user.middleware";
import { uploadError } from "../middleware/upload.middleware";

const router = express.Router();

router.post(
  "/upload-avatar",
  auth,
  avatarUpload.single("avatar"),
  uploadError,
  actions.uploadAvatar
); // 上传头像
router.post(
  "/upload-background",
  auth,
  backgroundUpload.single("background"),
  uploadError,
  actions.uploadBackground
); // 上传背景
router.post("/register", basic.register); // 注册
router.post("/login", basic.login); // 登录
router.get("/get-user-keywords", auth, otherData.getUserKeywords); // 获取用户的keywords
router.get("/get-article-labels", auth, otherData.getArticleLabels); // 获取文章标签列表
router.get("/get-user-info", auth, basic.getUserInfo); // 获取用户信息
router.post("/edit-user-info", auth, basic.editUserInfo); // 编辑用户信息
router.get("/get-user-like-num", auth, otherData.getUserLikeNum); // 获取用户发布文章的总点赞数
router.get("/get-user-collection-num", auth, otherData.getUserCollectionNum); // 获取用户发布文章的总收藏数
router.get("/get-liked-articles", auth, otherData.getLikedArticles); // 获取用户点赞的文章列表
router.get("/get-collected-articles", auth, otherData.getCollectedArticles); // 获取用户收藏的文章列表
router.post("/focus-user-actions", auth, actions.focusUserActions); // 用户关注的处理函数
router.get("/get-user-focus-list", auth, otherData.getUserFocusList); // 获取用户关注列表
router.get("/get-user-fans-list", auth, otherData.getUserFansList); // 获取用户粉丝列表
router.get("/get-user-article-tags", auth, otherData.getUserArticleTags); // 获取用户发布文章的标签列表
router.post("/like-action", auth, actions.addLike); // 用户点赞的处理函数
router.get("/user-like-list", auth, otherData.getUserLikeList); // 获取用户点赞列表
router.post("/collect-action", auth, actions.addCollect); // 用户收藏的处理函数
router.get("/user-collect-list", auth, otherData.getUserCollectList); // 获取用户收藏列表
router.get("/get-user-articles-basic", auth, otherData.getUserArticlesBasic); // 获取用户发布的文章列表（简要数据）
router.get(
  "/get-user-articles-details",
  auth,
  otherData.getUserArticlesDetails
); // 获取用户发布的文章列表（详细数据）

export default router;
