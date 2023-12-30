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
router.get("/get-user-keywords", otherData.getUserKeywords); // 获取用户的keywords（无需token）
router.get("/get-article-labels", otherData.getArticleLabels); // 获取文章标签列表（无需token）
router.get("/get-user-info", basic.getUserInfo); // 获取用户信息（无需token）
router.post("/edit-user-info", auth, basic.editUserInfo); // 编辑用户信息
router.get("/get-user-like-num", otherData.getUserLikeNum); // 获取用户发布文章的总点赞数（无需token）
router.get("/get-user-collection-num", otherData.getUserCollectionNum); // 获取用户发布文章的总收藏数（无需token）
router.get("/get-liked-articles", otherData.getLikedArticles); // 获取用户点赞的文章列表（无需token）
router.get("/get-collected-articles", otherData.getCollectedArticles); // 获取用户收藏的文章列表（无需token）
router.post("/focus-user-actions", auth, actions.focusUserActions); // 用户关注的处理函数
router.get("/get-user-focus-list", otherData.getUserFocusList); // 获取用户关注列表（无需token）
router.get("/get-user-fans-list", otherData.getUserFansList); // 获取用户粉丝列表（无需token）
router.get("/get-user-article-tags", otherData.getUserArticleTags); // 获取用户发布文章的标签列表（无需token）
router.post("/like-action", auth, actions.addLike); // 用户点赞的处理函数
router.get("/user-like-list", auth, otherData.getUserLikeList); // 获取用户点赞列表
router.post("/collect-action", auth, actions.addCollect); // 用户收藏的处理函数
router.get("/user-collect-list", otherData.getUserCollectList); // 获取用户收藏列表（无需token）
router.get("/get-user-articles-basic", otherData.getUserArticlesBasic); // 获取用户发布的文章列表（简要数据）（无需token）
router.get("/get-user-articles-details", otherData.getUserArticlesDetails); // 获取用户发布的文章列表（详细数据）（无需token）

export default router;
