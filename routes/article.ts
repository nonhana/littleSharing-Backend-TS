import express from "express";
import articleController from "../controller/article";
const router = express.Router();

// 编写有关articles的接口
router.get("/articlelist", articleController.getArticleList);
router.get("/articlemain", articleController.getArticleMain);
router.post("/postarticle", articleController.postArticle);
router.post("/addlabels", articleController.addArticleLabel);
router.post("/submitkeyword", articleController.submitSearchKeyword);
router.post("/postbookmark", articleController.addBookMark);
router.get("/getbookmark", articleController.getBookMark);
router.post("/removebookmark", articleController.removeBookMark);
router.post("/editarticle", articleController.editArticle);
router.post("/deletearticle", articleController.deleteArticle);
router.get("/userarticlelist", articleController.getUserArticleList);
router.post("/addarticletrend", articleController.postArticleTrend);
router.post("/increaseview", articleController.increaseArticleView);
router.get("/getarticletrend", articleController.getArticleTrend);

// 将路由对象共享出去
export default router;
