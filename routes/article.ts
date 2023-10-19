import express from "express";
import multer from "multer";
import { basic } from "../controller/article/basic";
import { otherData } from "../controller/article/otherData";
import { actions } from "../controller/article/actions";
import { auth } from "../middleware/user.middleware";
import { imgUploadError } from "../middleware/upload.middleware";

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
  imgUploadError,
  actions.uploadArticleImg
); // 上传文章图片
router.get("/article-list", auth, basic.getArticleList); // 获取文章列表
router.post("/post-article", auth, basic.postArticle); // 发布文章
router.post("/add-labels", auth, actions.addArticleLabel); // 新增文章标签
router.get("/article-main", auth, basic.getArticleMain); // 获取具体文章内容
router.post("/post-bookmark", auth, actions.addBookMark); // 添加文章书签
router.get("/get-bookmark", auth, otherData.getBookMark); // 获取文章书签
router.post("/remove-bookmark", auth, actions.removeBookMark); // 删除文章书签
router.post("/delete-article", auth, basic.deleteArticle); // 删除文章
router.post("/edit-article", auth, basic.editArticle); // 编辑文章
router.post("/add-article-trend", auth, actions.postArticleTrend); // 添加文章趋势
router.post("/increase-view", auth, actions.increaseArticleView); // 增加文章浏览量
router.get("/get-article-trend", auth, otherData.getArticleTrend); // 获取文章趋势
router.get("/search-article", auth, actions.searchArticle); // 搜索文章
router.get("/get-similar-articles", auth, actions.getSimilarArticles); // 获取相似文章

export default router;
