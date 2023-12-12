import type { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";
import type {
  Label,
  Bookmark,
  Trend,
  Keyword,
  ArticleSimple,
  ArticleSrc,
  AddArticleLabelRequestBody,
  AddBookMarkRequestBody,
  RemoveBookMarkRequestBody,
  PostArticleTrendRequestBody,
  IncreaseArticleViewRequestBody,
} from "./types";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";
import { months } from "../../constant";
import dotenv from "dotenv";
dotenv.config();

class Actions {
  // 上传文章图片
  uploadArticleImg = (req: Request, res: Response) => {
    if (!req.file) {
      unifiedResponseBody({
        httpStatus: 400,
        result_code: 1,
        result_msg: "未检测到上传文件",
        res,
      });
      return;
    }
    const imgPath = `${process.env.ARTICLE_IMG_PATH}/${req.file.filename}`;
    unifiedResponseBody({
      result_msg: "上传图片成功",
      result: imgPath,
      res,
    });
  };

  // 新增文章标签的处理函数
  addArticleLabel = async (req: Request, res: Response) => {
    const { label_list } = req.body as AddArticleLabelRequestBody;
    try {
      // 筛选出目前数据库中还没有的标签
      const retrieveRes: Label[] = await queryPromise(
        "select * from article_labels"
      );
      const labelSet = new Set<string>();
      retrieveRes.forEach((item) => labelSet.add(item.label_name));
      const newLabelList = label_list.filter((item) => !labelSet.has(item));
      // 将新标签插入数据库
      newLabelList.forEach(async (item) => {
        await queryPromise("insert into article_labels set ?", {
          label_name: item,
        });
      });
      unifiedResponseBody({
        res,
        result_msg: "新增文章标签成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "新增文章标签失败",
      });
    }
  };

  // 当用户在文章详情页进行书签的添加时，将该书签信息存入数据库
  addBookMark = async (req: AuthenticatedRequest, res: Response) => {
    const { article_id, topHeight } = req.body as AddBookMarkRequestBody;
    try {
      const bookmarks: Bookmark[] = await queryPromise(
        "SELECT * FROM article_bookmarks WHERE user_id = ?",
        req.state!.userInfo!.user_id
      );

      let flag = false;
      for (const item of bookmarks) {
        if (
          item.article_id === article_id &&
          item.user_id === req.state!.userInfo!.user_id
        ) {
          flag = true;
          await queryPromise(
            "UPDATE article_bookmarks SET topHeight = ? WHERE article_id = ? AND user_id = ?",
            [topHeight, article_id, req.state!.userInfo!.user_id]
          );
          break;
        }
      }

      if (!flag) {
        await queryPromise("INSERT INTO article_bookmarks SET ?", {
          article_id,
          topHeight,
          user_id: req.state!.userInfo!.user_id,
        });
      }
      unifiedResponseBody({
        res,
        result_msg: "新增/更新书签成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "新增/更新书签失败",
      });
    }
  };

  // 删除书签
  removeBookMark = async (req: AuthenticatedRequest, res: Response) => {
    const { article_id } = req.body as RemoveBookMarkRequestBody;
    try {
      await queryPromise(
        "delete from article_bookmarks where article_id = ? and user_id = ?",
        [article_id, req.state!.userInfo!.user_id]
      );
      unifiedResponseBody({
        result_msg: "移除书签成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "移除书签失败",
        result: { error },
        res,
      });
    }
  };

  // 提交浏览趋势的处理函数
  postArticleTrend = async (req: Request, res: Response) => {
    const { present_date, label_list } =
      req.body as PostArticleTrendRequestBody;
    const month = months[Number(present_date.slice(5, 7)) - 1]; // 拿到当前的月份
    try {
      const addTrend = async (item: string) => {
        const retrieveRes: Trend[] = await queryPromise(
          "SELECT * FROM scan_trend WHERE trend_name = ?",
          item
        );

        if (retrieveRes.length === 0) {
          await queryPromise(
            `INSERT INTO scan_trend (trend_name, ${month}) VALUES (?, 1)`,
            item
          );
        } else {
          await queryPromise(
            `UPDATE scan_trend SET ${month} = ${month} + 1 WHERE trend_name = ?`,
            item
          );
        }
      };

      await Promise.all(label_list.map((item) => addTrend(item)));
      unifiedResponseBody({
        res,
        result_msg: "提交浏览趋势成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "提交浏览趋势失败",
      });
    }
  };

  // 增加文章浏览量的处理函数
  increaseArticleView = async (req: Request, res: Response) => {
    const { article_id } = req.body as IncreaseArticleViewRequestBody;
    try {
      await queryPromise(
        "update articles set view_num = view_num + 1 where article_id = ?",
        article_id
      );
      unifiedResponseBody({
        res,
        result_msg: "增加文章浏览量成功",
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "增加文章浏览量失败",
        result: { error },
        res,
      });
    }
  };

  // 查询文章
  searchArticle = async (req: AuthenticatedRequest, res: Response) => {
    const { keyword: origin_keyword } = req.query;
    try {
      // 1. 通过article_title、article_major、article_labels、article_introduce进行模糊查询
      const articleListSource: ArticleSrc[] = await queryPromise(
        `
        SELECT articles.*, users.name as author_name, users.major as author_major, users.university as author_university, users.headphoto as author_headphoto, users.signature as author_signature, users.article_num as author_article_num
        from articles
        JOIN users ON articles.author_id = users.user_id
        where article_title like ? or article_major like ? or article_labels like ? or article_introduce like ?
        `,
        [
          `%${origin_keyword}%`,
          `%${origin_keyword}%`,
          `%${origin_keyword}%`,
          `%${origin_keyword}%`,
        ]
      );

      const article_list = articleListSource.map((item) => {
        const { artilce_md, ...article_item } = item;
        return {
          ...article_item,
          article_major: (item.article_major as string).split(","),
          article_labels: (item.article_labels as string).split(","),
        };
      });

      // 2. 搜索时将搜索关键词提交给数据库后台并做记录
      const keyword = (<string>origin_keyword).toLowerCase();
      const userKeyWordSource: Keyword[] = await queryPromise(
        "SELECT * FROM keywords WHERE user_id = ?",
        req.state!.userInfo!.user_id
      );

      let flag = false;
      for (const item of userKeyWordSource) {
        if (item.keywords_name === keyword) {
          flag = true;
          await queryPromise(
            "INSERT INTO keywords (keywords_name, keywords_count, user_id) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE keywords_count = keywords_count + 1",
            [keyword, req.state!.userInfo!.user_id]
          );
          break;
        }
      }
      if (!flag) {
        const insertNewKeyword = {
          keywords_name: keyword,
          keywords_count: 1,
          user_id: req.state!.userInfo!.user_id,
        };
        await queryPromise("INSERT INTO keywords SET ?", insertNewKeyword);
      }

      unifiedResponseBody({
        result_msg: "查询文章成功",
        result: article_list,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "查询文章失败",
        result: { error },
        res,
      });
    }
  };

  // 根据文章的label获取相似文章
  getSimilarArticles = async (req: Request, res: Response) => {
    const { labels, article_id } = req.query;
    try {
      let result = []; // 存放最终结果
      const articleIdSet = new Set<number>();
      const labelList = (<string>labels).split(",");

      // 使用Promise.all等待所有异步操作完成
      await Promise.all(
        labelList.map(async (item) => {
          const retrieveRes: { article_id: number }[] = await queryPromise(
            "select article_id from articles where article_labels like ?",
            `%${item}%`
          );
          retrieveRes.forEach((item) => articleIdSet.add(item.article_id));
        })
      );

      // 处理articleIdSet
      for (const article_id of articleIdSet) {
        let itemRes: ArticleSimple = (
          await queryPromise(
            `
            select 
            a.article_id,a.article_title,a.article_labels,a.article_introduce,a.article_uploaddate,a.author_id,u.name as author_name
            from articles as a
            join users as u on a.author_id = u.user_id
            where a.article_id = ?
            `,
            article_id
          )
        )[0];
        result.push({
          ...itemRes,
          article_labels: itemRes.article_labels.split(","),
        });
      }

      result = result.filter((item) => item.article_id !== Number(article_id));

      unifiedResponseBody({
        result_msg: "获取相似文章列表成功",
        result,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取相似文章列表失败",
        result: { error },
        res,
      });
    }
  };
}

export const actions = new Actions();
