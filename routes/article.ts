import express from "express";
import multer from "multer";
import { articleController } from "../controller/article";
import { auth } from "../middleware/user.middleware";

// 文章图片上传
const articleImgUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/uploads/images/article-imgs");
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
  "/upload-article-img",
  auth,
  articleImgUpload.single("articleImg"),
  articleController.uploadArticleImg
);
router.get("/article-list", auth, articleController.getArticleList);
router.post("/post-article", auth, articleController.postArticle);
router.post("/add-labels", auth, articleController.addArticleLabel);
router.get("/article-main", auth, articleController.getArticleMain);
router.post("/submit-keyword", auth, articleController.submitSearchKeyword);
router.post("/post-bookmark", auth, articleController.addBookMark);
router.get("/get-bookmark", auth, articleController.getBookMark);
router.post("/remove-bookmark", auth, articleController.removeBookMark);
router.post("/delete-article", auth, articleController.deleteArticle);
router.post("/edit-article", auth, articleController.editArticle);
router.get("/user-article-list", auth, articleController.getUserArticleList);
router.post("/add-article-trend", auth, articleController.postArticleTrend);
router.post("/increase-view", auth, articleController.increaseArticleView);
router.get("/get-article-trend", auth, articleController.getArticleTrend);

export default router;
