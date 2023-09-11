import express from "express";
import { articleController } from "../controller/article";
import { auth } from "../middleware/user.middleware";

const router = express.Router();

router.get("/articlelist", auth, articleController.getArticleList);
router.get("/articlemain", auth, articleController.getArticleMain);
router.post("/postarticle", auth, articleController.postArticle);
router.post("/addlabels", auth, articleController.addArticleLabel);
router.post("/submitkeyword", auth, articleController.submitSearchKeyword);
router.post("/postbookmark", auth, articleController.addBookMark);
router.get("/getbookmark", auth, articleController.getBookMark);
router.post("/removebookmark", auth, articleController.removeBookMark);
router.post("/editarticle", auth, articleController.editArticle);
router.post("/deletearticle", auth, articleController.deleteArticle);
router.get("/userarticlelist", auth, articleController.getUserArticleList);
router.post("/addarticletrend", auth, articleController.postArticleTrend);
router.post("/increaseview", auth, articleController.increaseArticleView);
router.get("/getarticletrend", auth, articleController.getArticleTrend);

export default router;
