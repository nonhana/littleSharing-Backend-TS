import type { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
  getImgSrc,
} from "../utils/index";
import type {
  ArticleBasicInfo,
  UserInfo,
  ArticleListItem,
  UserKeyword,
  Bookmark,
  Trend,
} from "../daos/articles";

class ArticleController {
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
        result: { articleList },
      });
    } catch (error) {
      errorHandler({
        res,
        error,
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
        result: { article_main },
      });
    } catch (error) {
      errorHandler({
        res,
        error,
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
        result_msg: "编辑文章失败",
      });
    }
  };

  // 删除文章的处理函数
  deleteArticle = async (req: Request, res: Response) => {
    const { article_id } = req.body;
    try {
      await queryPromise("delete from articles where article_id=?", article_id);
      unifiedResponseBody({
        res,
        result_msg: "删除文章成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
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
        result_msg: "新增文章标签失败",
      });
    }
  };

  // 搜索时将搜索关键词提交给数据库后台并做记录
  submitSearchKeyword = async (req: Request, res: Response) => {
    const { keyword: origin_keyword, user_id } = req.body;
    try {
      const keyword = origin_keyword.toLowerCase();
      const retrieveRes = (await queryPromise(
        "SELECT * FROM keywords WHERE user_id=?",
        user_id
      )) as UserKeyword[];

      let flag = false;
      for (const item of retrieveRes) {
        if (item.keywords_name === keyword) {
          flag = true;
          const sql_UpdateKeywordCount =
            "INSERT INTO keywords (keywords_name, keywords_count, user_id) VALUES (?, 1, ?) " +
            "ON DUPLICATE KEY UPDATE keywords_count = keywords_count + 1";
          await queryPromise(sql_UpdateKeywordCount, [keyword, user_id]);
          break;
        }
      }

      if (!flag) {
        const insertNewKeyword = {
          keywords_name: keyword,
          keywords_count: 1,
          user_id: user_id,
        };
        const sql_InsertNewKeyword = "INSERT INTO keywords SET ?";
        await queryPromise(sql_InsertNewKeyword, insertNewKeyword);
      }
      unifiedResponseBody({
        res,
        result_msg: "上传关键词成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result_msg: "上传关键词失败",
      });
    }
  };

  // 当用户在文章详情页进行书签的添加时，将该书签信息存入数据库
  addBookMark = async (req: Request, res: Response) => {
    const new_bookmark = req.body;
    try {
      const user_id = new_bookmark.user_id;

      const bookmarks = (await queryPromise(
        "SELECT * FROM article_bookmarks WHERE user_id=?",
        [user_id]
      )) as Bookmark[];

      let flag = false;
      for (const item of bookmarks) {
        if (
          item.article_id === new_bookmark.article_id &&
          item.user_id === new_bookmark.user_id
        ) {
          flag = true;
          const sql_UpdateBookMark =
            "UPDATE article_bookmarks SET topHeight=? WHERE article_id=? AND user_id=?";
          await queryPromise(sql_UpdateBookMark, [
            new_bookmark.topHeight,
            new_bookmark.article_id,
            new_bookmark.user_id,
          ]);
          break;
        }
      }

      if (!flag) {
        const sql_AddBookMark = "INSERT INTO article_bookmarks SET ?";
        await queryPromise(sql_AddBookMark, new_bookmark);
      }
      unifiedResponseBody({
        res,
        result_msg: "新增/更新书签成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result_msg: "新增/更新书签失败",
      });
    }
  };

  //获取指定用户的文章书签
  getBookMark = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "select * from article_bookmarks where user_id=?",
        user_id
      );
      unifiedResponseBody({
        res,
        result_msg: "获取书签成功",
        result: { retrieveRes },
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result_msg: "获取书签失败",
      });
    }
  };

  // 移除用户添加的标签
  removeBookMark = async (req: Request, res: Response) => {
    const bookmark_info = req.body;
    try {
      await queryPromise(
        "delete from article_bookmarks where article_id=? and user_id=?",
        [bookmark_info.article_id, bookmark_info.user_id]
      );
      unifiedResponseBody({
        res,
        result_msg: "移除书签成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result_msg: "移除书签失败",
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
        res,
        result_msg: "获取用户文章列表成功",
        result: { user_article_list },
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result_msg: "获取用户文章列表失败",
      });
    }
  };

  // 提交浏览趋势的处理函数
  postArticleTrend = async (req: Request, res: Response) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const { present_date, label_list } = req.body;
    const month = months[Number(present_date.slice(5, 7)) - 1];
    try {
      const addTrend = async (item: string) => {
        const retrieveRes = (await queryPromise(
          "SELECT * FROM scan_trend WHERE trend_name = ?",
          item
        )) as Trend[];
        if (retrieveRes.length === 0) {
          const sql_PostArticleTrend = `INSERT INTO scan_trend (trend_name, ${month}) VALUES (?, 1)`;
          await queryPromise(sql_PostArticleTrend, item);
        } else {
          const sql_UpdateTrend = `UPDATE scan_trend SET ${month} = ${month} + 1 WHERE trend_name = ?`;
          await queryPromise(sql_UpdateTrend, item);
        }
      };

      // Promise.all接收一个全是Promise的数组，等待所有的Promise解析完成
      await Promise.all(label_list.map((item: string) => addTrend(item)));
      unifiedResponseBody({
        res,
        result_msg: "提交浏览趋势成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
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
        res,
        error,
        result_msg: "增加文章浏览量失败",
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
        result: { topFiveTrends },
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result_msg: "获取文章趋势失败",
      });
    }
  };
}

export const articleController = new ArticleController();
