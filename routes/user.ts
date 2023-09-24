import express from "express";
import multer from "multer";
import { userController } from "../controller/user";
import { auth } from "../middleware/user.middleware";
import { imgUploadError } from "../middleware/upload.middleware";

// 头像上传
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/uploads/images/avatars");
    },
    filename(_, file, cb) {
      cb(
        null,
        `${Date.now()}_${Math.floor(Math.random() * 1e9)}.${
          file.mimetype.split("/")[1]
        }`
      );
    },
  }),
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 定义允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持jpg和png格式的图片，请重新上传"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 限制最大图片5MB
  },
});
// 背景上传
const backgroundUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/uploads/images/backgrounds");
    },
    filename(_, file, cb) {
      cb(
        null,
        `${Date.now()}_${Math.floor(Math.random() * 1e9)}.${
          file.mimetype.split("/")[1]
        }`
      );
    },
  }),
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 定义允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持jpg和png格式的图片，请重新上传"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 限制最大图片5MB
  },
});

const router = express.Router();

router.post(
  "/upload-avatar",
  auth,
  avatarUpload.single("avatar"),
  imgUploadError,
  userController.uploadAvatar
);
router.post(
  "/upload-background",
  auth,
  backgroundUpload.single("background"),
  imgUploadError,
  userController.uploadBackground
);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/get-user-keywords", auth, userController.getUserKeywords);
router.get("/get-article-labels", auth, userController.getArticleLabels);
router.get("/get-user-info", auth, userController.getUserInfo);
router.post("/edit-user-info", auth, userController.editUserInfo);
router.get("/get-user-like-num", auth, userController.getUserLikeNum);
router.get(
  "/get-user-collection-num",
  auth,
  userController.getUserCollectionNum
);
router.get("/get-liked-articles", auth, userController.getLikedArticles);
router.get(
  "/get-collected-articles",
  auth,
  userController.getCollectedArticles
);
router.post("/focus-user-actions", auth, userController.focusUserActions);
router.get("/get-user-focus-list", auth, userController.getUserFocusList);
router.get("/get-user-fans-list", auth, userController.getUserFansList);
router.get("/get-user-article-tags", auth, userController.getUserArticleTags);
router.post("/like-action", auth, userController.addLike);
router.get("/user-like-list", auth, userController.getUserLikeList);
router.post("/collect-action", auth, userController.addCollect);
router.get("/user-collect-list", auth, userController.getUserCollectList);

export default router;
