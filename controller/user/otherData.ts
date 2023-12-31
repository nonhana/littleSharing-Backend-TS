import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";
import type { Keyword, Label, Like, Collect } from "./types";
import type { Article, ArticleSimple } from "../article/types";
import dotenv from "dotenv";
dotenv.config();

class OtherData {
  // 获取用户的keywords
  getUserKeywords = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      // 获取该用户的keywords
      const keywords: Keyword[] = await queryPromise(
        "select keywords_name, keywords_count from keywords where user_id = ?",
        user_id
      );
      unifiedResponseBody({
        result_msg: "获取用户keywords成功",
        result: keywords,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户keywords失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户的article_labels
  getArticleLabels = async (_: Request, res: Response) => {
    try {
      // 获取全局的article_labels
      const labels: Label[] = await queryPromise(
        "select label_name as label from article_labels"
      );
      labels.forEach((item) => {
        item.value = item.label;
      });
      unifiedResponseBody({
        result_msg: "获取文章标签列表成功",
        result: labels,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取文章标签列表失败",
        result: { error },
        res,
      });
    }
  };

  // 获取用户发布文章的总点赞数
  getUserLikeNum = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes: { like_num: number }[] = await queryPromise(
        "select like_num from articles where author_id = ?",
        user_id
      );
      let total_like_num = 0;
      retrieveRes.forEach((item) => {
        total_like_num += item.like_num;
      });
      unifiedResponseBody({
        result_msg: "获取用户点赞数成功",
        result: total_like_num,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户点赞数失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户发布文章的总收藏数
  getUserCollectionNum = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes: { collection_num: number }[] = await queryPromise(
        "select collection_num from articles where author_id = ?",
        user_id
      );
      let total_collection_num = 0;
      retrieveRes.forEach((item) => {
        total_collection_num += item.collection_num;
      });
      unifiedResponseBody({
        result_msg: "获取用户收藏数成功",
        result: total_collection_num,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户收藏数失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户的被点赞文章数据
  getLikedArticles = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes: Like[] = await queryPromise(
        "select * from article_like where article_id in (select article_id from articles where author_id = ? )",
        user_id
      );
      unifiedResponseBody({
        result_msg: "获取用户点赞文章成功",
        result: retrieveRes,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户点赞文章失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户的被收藏文章数据
  getCollectedArticles = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes: Collect[] = await queryPromise(
        "select * from article_collect where article_id in (select article_id from articles where author_id = ?)",
        user_id
      );
      unifiedResponseBody({
        result_msg: "获取用户收藏文章成功",
        result: retrieveRes,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户收藏文章失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户关注列表
  getUserFocusList = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes: { second_user_id: number }[] = await queryPromise(
        "select second_user_id from user_focus where first_user_id = ?",
        user_id
      );
      unifiedResponseBody({
        result_msg: "获取用户关注列表成功",
        result: retrieveRes,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户关注列表失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户粉丝列表
  getUserFansList = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes: { first_user_id: number }[] = await queryPromise(
        "select first_user_id from user_focus where second_user_id = ?",
        user_id
      );
      unifiedResponseBody({
        result_msg: "获取用户粉丝列表成功",
        result: retrieveRes,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户粉丝列表失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户发布的文章标签列表
  getUserArticleTags = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      // 1. 获取用户发布的文章列表
      const retrieveRes: { article_labels: string }[] = await queryPromise(
        "select article_labels from articles where author_id = ?",
        user_id
      );
      // 2. 对用户发布的文章标签进行统计
      const source_data = retrieveRes.map((item) => item.article_labels);
      const countOccurrences = (arr: string[]) => {
        const counts: {
          [key: string]: number;
        } = {};
        arr.forEach((item) => {
          const items = item.split(",");
          items.forEach((item) => {
            const key = item.trim();
            if (key in counts) {
              counts[key]++;
            } else {
              counts[key] = 1;
            }
          });
        });
        return counts;
      };
      const counts = countOccurrences(source_data);
      const sortedCounts = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const resultArray = sortedCounts.map(([tag_name, count]) => ({
        tag_name,
        count,
      }));
      unifiedResponseBody({
        result_msg: "获取用户文章标签列表成功",
        result: resultArray,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户文章标签列表失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户的点赞列表
  getUserLikeList = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const retrieveRes: { article_id: number }[] = await queryPromise(
        "select article_id from article_like where user_id=?",
        req.state!.userInfo!.user_id
      );

      const like_list = retrieveRes.map((item) => item.article_id);

      unifiedResponseBody({
        result_msg: "获取点赞列表成功",
        result: like_list,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        res,
        result: {
          error,
        },
        result_msg: "获取点赞列表失败",
      });
    }
  };

  // 获取用户的收藏列表
  getUserCollectList = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes: { article_id: number }[] = await queryPromise(
        "select article_id from article_collect where user_id=?",
        user_id
      );

      const collect_list = retrieveRes.map((item) => item.article_id);

      unifiedResponseBody({
        result_msg: "获取收藏列表成功",
        result: collect_list,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        res,
        result: {
          error,
        },
        result_msg: "获取收藏列表失败",
      });
    }
  };

  // 获取某个用户发布的文章列表（简要数据）
  getUserArticlesBasic = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      // 拿到文章列表，和用户表进行联表查询
      const sql = `
        select 
        a.article_id, a.article_title, a.article_labels, a.article_introduce, a.article_uploaddate, a.author_id, u.name as author_name
        from articles as a
        join users as u on a.author_id = u.user_id
        where a.author_id = ?
      `;

      const retrieveRes: ArticleSimple[] = await queryPromise(sql, user_id);

      const result = retrieveRes.map((item) => {
        return {
          ...item,
          article_labels: item.article_labels.split(","),
        };
      });

      unifiedResponseBody({
        result_msg: "获取用户文章列表成功",
        result,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        res,
        result: {
          error,
        },
        result_msg: "获取用户文章列表失败",
      });
    }
  };

  // 获取某个用户发布的文章列表（详细数据）
  getUserArticlesDetails = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const sql = `
        SELECT articles.*, users.name as author_name, users.major as author_major, users.university as author_university, users.headphoto as author_headphoto, users.signature as author_signature, users.article_num as author_article_num
        FROM articles
        JOIN users ON articles.author_id = users.user_id
        WHERE articles.author_id = ?
      `;
      const retrieveRes: Article[] = await queryPromise(sql, user_id);

      const result = retrieveRes.map((item) => {
        return {
          ...item,
          article_major: item.article_major.split(","),
          article_labels: item.article_labels.split(","),
        };
      });

      unifiedResponseBody({
        res,
        result_msg: "获取文章列表成功",
        result,
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
}

export const otherData = new OtherData();
