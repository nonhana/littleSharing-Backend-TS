import type { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
  getImgSrc,
  shuffle,
} from "../utils/index";
import type { AuthenticatedRequest } from "../middleware/user.middleware";
import type {
  ArticleBasicInfo,
  UserInfo,
  ArticleListItem,
  UserKeyword,
  Bookmark,
  Trend,
} from "../types/articles";
import { months } from "../constant";
import dotenv from "dotenv";
dotenv.config();

class ArticleController {
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
      result: {
        imgURL: imgPath,
      },
      res,
    });
  };

  // 获取文章列表的处理函数
  getArticleList = async (_: Request, res: Response) => {
    try {
      // 1. 获取文章列表
      const retrieveRes = (await queryPromise(
        "SELECT * FROM articles"
      )) as ArticleBasicInfo[];

      // 2. 获取文章作者信息
      const articleList = await Promise.all(
        retrieveRes.map(async (item) => {
          const sql_SelectUserInfo =
            "SELECT name, major, university, headphoto, signature, article_num FROM users WHERE id=?";
          const userInfoList = (await queryPromise(
            sql_SelectUserInfo,
            item.author_id
          )) as UserInfo[];
          const articleInfo: ArticleListItem = {
            ...item,
            cover_image: "",
            author_name: "",
            author_major: "",
            author_university: "",
            author_headphoto: "",
            author_signature: "",
            article_num: 0,
          };
          articleInfo.cover_image = getImgSrc(item.article_details)[0];
          articleInfo.author_name = userInfoList[0].name;
          articleInfo.author_major = userInfoList[0].major;
          articleInfo.author_university = userInfoList[0].university;
          articleInfo.author_headphoto = userInfoList[0].headphoto;
          articleInfo.author_signature = userInfoList[0].signature;
          articleInfo.article_num = userInfoList[0].article_num;
          articleInfo.article_major = (
            articleInfo.article_major as string
          ).split(",");
          articleInfo.article_labels = (
            articleInfo.article_labels as string
          ).split(",");
          return articleInfo;
        })
      );
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
      const retrieveRes = (await queryPromise(
        "SELECT * FROM articles WHERE article_id=?",
        article_id
      )) as ArticleBasicInfo[];

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

  // 新增文章标签的处理函数
  addArticleLabel = async (req: Request, res: Response) => {
    const newlabel = req.body;
    try {
      await queryPromise("insert into article_labels set ?", newlabel);
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

  // 搜索时将搜索关键词提交给数据库后台并做记录
  submitSearchKeyword = async (req: AuthenticatedRequest, res: Response) => {
    const { keyword: origin_keyword } = req.body;
    try {
      const keyword = origin_keyword.toLowerCase();
      const retrieveRes = (await queryPromise(
        "SELECT * FROM keywords WHERE user_id = ?",
        req.state!.userInfo.user_id
      )) as UserKeyword[];

      let flag = false;
      for (const item of retrieveRes) {
        if (item.keywords_name === keyword) {
          flag = true;
          await queryPromise(
            "INSERT INTO keywords (keywords_name, keywords_count, user_id) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE keywords_count = keywords_count + 1",
            [keyword, req.state!.userInfo.user_id]
          );
          break;
        }
      }
      if (!flag) {
        const insertNewKeyword = {
          keywords_name: keyword,
          keywords_count: 1,
          user_id: req.state!.userInfo.user_id,
        };
        await queryPromise("INSERT INTO keywords SET ?", insertNewKeyword);
      }
      unifiedResponseBody({
        result_msg: "上传关键词成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "上传关键词失败",
        result: { error },
        res,
      });
    }
  };

  // 当用户在文章详情页进行书签的添加时，将该书签信息存入数据库
  addBookMark = async (req: AuthenticatedRequest, res: Response) => {
    const { article_id, topHeight } = req.body;
    try {
      const bookmarks = (await queryPromise(
        "SELECT * FROM article_bookmarks WHERE user_id = ?",
        req.state!.userInfo.user_id
      )) as Bookmark[];

      let flag = false;
      for (const item of bookmarks) {
        if (
          item.article_id === article_id &&
          item.user_id === req.state!.userInfo.user_id
        ) {
          flag = true;
          await queryPromise(
            "UPDATE article_bookmarks SET topHeight = ? WHERE article_id = ? AND user_id = ?",
            [topHeight, article_id, req.state!.userInfo.user_id]
          );
          break;
        }
      }

      if (!flag) {
        await queryPromise("INSERT INTO article_bookmarks SET ?", {
          article_id,
          topHeight,
          user_id: req.state!.userInfo.user_id,
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

  //获取文章书签
  getBookMark = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const retrieveRes = await queryPromise(
        "select * from article_bookmarks where user_id = ?",
        req.state!.userInfo.user_id
      );
      unifiedResponseBody({
        res,
        result_msg: "获取书签成功",
        result: retrieveRes,
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "获取书签失败",
      });
    }
  };

  // 删除书签
  removeBookMark = async (req: AuthenticatedRequest, res: Response) => {
    const { article_id } = req.body;
    try {
      await queryPromise(
        "delete from article_bookmarks where article_id = ? and user_id = ?",
        [article_id, req.state!.userInfo.user_id]
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

  // 获取某用户的发布文章列表
  getUserArticleList = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes = (await queryPromise(
        "select * from articles where author_id = ?",
        user_id
      )) as ArticleBasicInfo[];

      const user_article_list = retrieveRes.map((item) => {
        const { article_details, article_md, ...article_item } = item;
        article_item.article_major = (item.article_major as string).split(",");
        article_item.article_labels = (item.article_labels as string).split(
          ","
        );
        return article_item;
      });
      unifiedResponseBody({
        result_msg: "获取用户文章列表成功",
        result: user_article_list,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户文章列表失败",
        result: { error },
        res,
      });
    }
  };

  // 提交浏览趋势的处理函数
  postArticleTrend = async (req: Request, res: Response) => {
    const { present_date, label_list } = req.body;
    const month = months[Number(present_date.slice(5, 7)) - 1];
    try {
      const addTrend = async (item: string) => {
        const retrieveRes = (await queryPromise(
          "SELECT * FROM scan_trend WHERE trend_name = ?",
          item
        )) as Trend[];

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

      await Promise.all(label_list.map((item: string) => addTrend(item)));
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
    const { article_id } = req.body;
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

  // 获取文章趋势的处理函数
  getArticleTrend = async (_: Request, res: Response) => {
    try {
      const source = (await queryPromise(
        "select * from scan_trend"
      )) as Trend[];

      const updatedTrends = source.map((trend: Trend) => {
        const {
          January,
          February,
          March,
          April,
          May,
          June,
          July,
          August,
          September,
          October,
          November,
          December,
        } = trend;
        const total =
          January +
          February +
          March +
          April +
          May +
          June +
          July +
          August +
          September +
          October +
          November +
          December;
        return { ...trend, total };
      });
      updatedTrends.sort((a, b) => b.total - a.total);
      const topFiveTrends = updatedTrends.slice(0, 5).map((trend: Trend) => {
        const {
          id,
          trend_name,
          January,
          February,
          March,
          April,
          May,
          June,
          July,
          August,
          September,
          October,
          November,
          December,
        } = trend;
        const value_list = [
          January,
          February,
          March,
          April,
          May,
          June,
          July,
          August,
          September,
          October,
          November,
          December,
        ];
        return { id, trend_name, value_list };
      });
      unifiedResponseBody({
        res,
        result_msg: "获取文章趋势成功",
        result: topFiveTrends,
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "获取文章趋势失败",
      });
    }
  };
}

export const articleController = new ArticleController();
