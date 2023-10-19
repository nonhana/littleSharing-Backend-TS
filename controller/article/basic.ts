import type { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
  getImgSrc,
  shuffle,
} from "../../utils/index";

class Basic {
  // 获取文章列表的处理函数
  getArticleList = async (_: Request, res: Response) => {
    try {
      // 使用 JOIN 语句合并两个查询
      const sql = `
        SELECT articles.*, users.name as author_name, users.major as author_major, users.university as author_university, users.headphoto as author_headphoto, users.signature as author_signature, users.article_num as author_article_num
        FROM articles
        JOIN users ON articles.author_id = users.user_id
      `;
      const retrieveRes = await queryPromise(sql);

      // 处理文章列表
      const articleList = retrieveRes.map((item: any) => {
        const articleInfo = {
          ...item,
          cover_image: getImgSrc(item.article_details)[0],
        };
        articleInfo.article_major = articleInfo.article_major.split(",");
        articleInfo.article_labels = articleInfo.article_labels.split(",");
        return articleInfo;
      });

      unifiedResponseBody({
        res,
        result_msg: "获取文章列表成功",
        result: shuffle(articleList),
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "获取文章列表失败",
      });
    }
  };

  // 获取具体文章内容的处理函数
  getArticleMain = async (req: Request, res: Response) => {
    const { article_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "SELECT * FROM articles WHERE article_id=?",
        article_id
      );

      let article_main = retrieveRes[0];
      article_main.article_major = (article_main.article_major as string).split(
        ","
      );
      article_main.article_labels = (
        article_main.article_labels as string
      ).split(",");
      unifiedResponseBody({
        res,
        result_msg: "获取文章内容成功",
        result: article_main,
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "获取文章内容失败",
      });
    }
  };

  // 上传文章的处理函数
  postArticle = async (req: Request, res: Response) => {
    const article_body = req.body;
    try {
      const article = {
        ...article_body,
        article_major: article_body.article_major.join(","),
        article_labels: article_body.article_labels.join(","),
      };
      await queryPromise("INSERT INTO articles SET ?", article);
      unifiedResponseBody({
        res,
        result_msg: "上传文章成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "上传文章失败",
      });
    }
  };

  // 编辑文章的处理函数
  editArticle = async (req: Request, res: Response) => {
    const { article_id, ...update_article } = req.body;
    try {
      // 将major转换成以','分隔的字符串存储
      update_article.article_major = update_article.article_major.join(",");
      // 将labels转换成以','分隔的字符串存储
      update_article.article_labels = update_article.article_labels.join(",");
      await queryPromise("update articles set ? where article_id = ?", [
        update_article,
        article_id,
      ]);
      unifiedResponseBody({
        res,
        result_msg: "编辑文章成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "编辑文章失败",
      });
    }
  };

  // 删除文章的处理函数
  deleteArticle = async (req: Request, res: Response) => {
    const { article_id } = req.body;
    try {
      await queryPromise(
        "delete from articles where article_id = ?",
        article_id
      );
      unifiedResponseBody({
        res,
        result_msg: "删除文章成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "删除文章失败",
      });
    }
  };
}

export const basic = new Basic();
