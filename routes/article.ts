import express from "express";
import { basic } from "../controller/article/basic";
import { otherData } from "../controller/article/otherData";
import { actions } from "../controller/article/actions";
import { auth } from "../middleware/user.middleware";
import {
  articleImgUpload,
  uploadError,
  getMDFilePath,
  saveMDFile,
} from "../middleware/upload.middleware";

const router = express.Router();

router.post(
  "/upload-article-img",
  auth,
  articleImgUpload.single("articleImg"),
  uploadError,
  actions.uploadArticleImg
); // 上传文章图片
router.get("/article-list", basic.getArticleList); // 获取文章列表（无需token）
router.get("/latest-articles", basic.getLatestArticleList); // 获取最新发布的文章列表（无需token）
router.post(
  "/post-article",
  auth,
  getMDFilePath,
  saveMDFile,
  basic.postArticle
); // 发布文章
router.post("/add-labels", auth, actions.addArticleLabel); // 新增文章标签
router.post("/remove-label", auth, actions.removeArticleLabel); // 删除文章标签
router.get("/article-main", basic.getArticleMain); // 获取具体文章内容（无需token）
router.post("/post-bookmark", auth, actions.addBookMark); // 添加文章书签
router.get("/get-bookmark", auth, otherData.getBookMark); // 获取文章书签
router.post("/remove-bookmark", auth, actions.removeBookMark); // 删除文章书签
router.post("/delete-article", auth, basic.deleteArticle); // 删除文章
router.post(
  "/edit-article",
  auth,
  getMDFilePath,
  saveMDFile,
  basic.editArticle
); // 编辑文章
router.post("/add-article-trend", actions.postArticleTrend); // 添加文章趋势（无需token）
router.post("/increase-view", actions.increaseArticleView); // 增加文章浏览量（无需token）
router.get("/get-article-trend", otherData.getArticleTrend); // 获取文章趋势（无需token）
router.get("/search-article", actions.searchArticle); // 搜索文章（无需token）
router.get("/get-similar-articles", actions.getSimilarArticles); // 获取相似文章（无需token）

export default router;
