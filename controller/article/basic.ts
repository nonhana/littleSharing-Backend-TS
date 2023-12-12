import type { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
  getMarkdownImgSrc,
  shuffle,
} from "../../utils/index";
import type {
  Article,
  PostArticleRequestBody,
  EditArticleRequestBody,
  DeleteArticleRequestBody,
} from "./types";

class Basic {
  // 获取文章列表的处理函数
  getArticleList = async (req: Request, res: Response) => {
    const { page = 1, size = 5 } = req.query; // 默认值为第1页，每页5条
    if (<number>page < 1 || <number>size < 1) {
      unifiedResponseBody({
        res,
        result_code: 1,
        result_msg: "page和size参数值必须为正整数",
      });
      return;
    }
    const offset = (<number>page - 1) * <number>size;

    try {
      // 使用 JOIN 语句合并两个查询，并添加 LIMIT 和 OFFSET 以实现分页
      const sql = `
        SELECT articles.*, users.name as author_name, users.major as author_major, users.university as author_university, users.headphoto as author_headphoto, users.signature as author_signature, users.article_num as author_article_num
        FROM articles
        JOIN users ON articles.author_id = users.user_id
        LIMIT ${size} OFFSET ${offset}
      `;
      const retrieveRes: Article[] = await queryPromise(sql);

      // 处理文章列表
      const articleList = retrieveRes.map((item) => {
        return {
          ...item,
          cover_image: getMarkdownImgSrc(item.article_md)[0],
          article_major: item.article_major.split(","),
          article_labels: item.article_labels.split(","),
        };
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
      // 使用 JOIN 语句合并两个查询
      const sql = `
        SELECT articles.*, users.name as author_name, users.major as author_major, users.university as author_university, users.headphoto as author_headphoto, users.signature as author_signature, users.article_num as author_article_num
        FROM articles
        JOIN users ON articles.author_id = users.user_id
        WHERE article_id=?
      `;
      const retrieveRes: Article[] = await queryPromise(sql, article_id);
      const result = {
        ...retrieveRes[0],
        article_major: retrieveRes[0].article_major.split(","),
        article_labels: retrieveRes[0].article_labels.split(","),
      };
      unifiedResponseBody({
        res,
        result_msg: "获取文章内容成功",
        result,
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
    const article_body = req.body as PostArticleRequestBody;
    try {
      const article = {
        ...article_body,
        article_major: article_body.article_major.join(","),
        article_labels: article_body.article_labels.join(","),
      };
      const { insertId } = await queryPromise(
        "INSERT INTO articles SET ?",
        article
      );
      unifiedResponseBody({
        res,
        result_msg: "上传文章成功",
        result: insertId,
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
    const { article_id, ...update_article } =
      req.body as EditArticleRequestBody;
    try {
      const result = {
        ...update_article,
        article_major: update_article.article_major.join(","),
        article_labels: update_article.article_labels.join(","),
      };

      await queryPromise("update articles set ? where article_id = ?", [
        result,
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
    const { article_id } = req.body as DeleteArticleRequestBody;
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
