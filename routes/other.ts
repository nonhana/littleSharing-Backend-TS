import express from "express";
import { otherController } from "../controller/other";
import { auth } from "../middleware/user.middleware";
import multer from "multer";
import path from "path";

const router = express.Router();

// 使用multer中间件处理图片上传
const imgUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/uploads/images");
    },
    filename(_, file, cb) {
      cb(
        null,
        `${Date.now()}_${Math.floor(Math.random() * 1e9)}${path.extname(
          file.originalname
        )}`
      );
    },
  }),
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 定义允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件类型"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 限制最大图片10MB
  },
});

router.post(
  "/uploadimg",
  auth,
  imgUpload.single("image"),
  otherController.uploadImg
);
router.post("/deleteimg", auth, otherController.deleteImg);
router.post("/likeaction", auth, otherController.addLike);
router.get("/userlikelist", auth, otherController.getUserLikeList);
router.post("/collectaction", auth, otherController.addCollect);
router.get("/usercollectlist", auth, otherController.getUserCollectList);
router.get("/commentlist", auth, otherController.getCommentList);
router.post("/commentaction", auth, otherController.commentAction);
router.post("/commentlikeaction", auth, otherController.commentLikeAction);
router.get("/commentlikelist", auth, otherController.getCommentLikeList);

export default router;
