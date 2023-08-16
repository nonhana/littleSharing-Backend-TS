import db from "../database/index";
import type { Request, Response } from "express";
import type {
  ArticleBasicInfo,
  UserInfo,
  ArticleListItem,
  UserKeyword,
  Bookmark,
  Trend,
} from "../daos/articles";
import type { OkPacket } from "mysql";

const articleController: {
  [key in string]: (req: Request, res: Response) => void;
} = {};

// 辅助函数：执行数据库查询并返回Promise，保证查询完成后再执行后续操作
function query(sql: string, ...params: unknown[]) {
  return new Promise((resolve, reject) => {
    db.query(sql, params[0], (err, results) => {
      if (err) {
        reject(err);
      } else {
        // resolve(results)之后，可以直接通过.then()获取到resolve()中传递的数据
        resolve(results);
      }
    });
  });
}

// 辅助函数：获取文章详情中的图片链接
function getImgSrc(htmlstr: string) {
  const reg = /<img.+?src=('|")?([^'"]+)('|")?(?:\s+|>)/gim;
  const arr = [];
  let tem;
  while ((tem = reg.exec(htmlstr))) {
    arr.push(tem[2]);
  }
  return arr;
}

// 获取文章列表的处理函数
articleController.getArticleList = async (_, res) => {
  try {
    const sql_SelectAllArticles = "SELECT * FROM articles";
    const results1 = (await query(sql_SelectAllArticles)) as ArticleBasicInfo[];

    const articleList = await Promise.all(
      results1.map(async (item) => {
        const sql_SelectUserInfo =
          "SELECT name, major, university, headphoto, signature, article_num FROM users WHERE id=?";
        const results2 = (await query(
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
        articleInfo.author_name = results2[0].name;
        articleInfo.author_major = results2[0].major;
        articleInfo.author_university = results2[0].university;
        articleInfo.author_headphoto = results2[0].headphoto;
        articleInfo.author_signature = results2[0].signature;
        articleInfo.article_num = results2[0].article_num;
        articleInfo.article_major = (articleInfo.article_major as string).split(
          ","
        );
        articleInfo.article_labels = (
          articleInfo.article_labels as string
        ).split(",");

        return articleInfo;
      })
    );

    res.send({
      result_code: 0,
      result_msg: "get article list succeed",
      article_list: articleList,
    });
  } catch (err: any) {
    res.send({
      result_code: 1,
      result_msg: "get article list fail: " + err.message,
    });
  }
};

// 获取具体文章内容的处理函数
articleController.getArticleMain = async (req, res) => {
  try {
    const article_id = req.query.article_id;

    const sql_GetArticleMain = "SELECT * FROM articles WHERE article_id=?";
    const results = (await query(sql_GetArticleMain, [
      article_id,
    ])) as ArticleBasicInfo[];

    if (results.length !== 1) {
      return res.send({
        result_code: 1,
        result_msg: "get article main failed: results.length != 1",
      });
    }

    let article_main = results[0];
    article_main.article_major = (article_main.article_major as string).split(
      ","
    );
    article_main.article_labels = (article_main.article_labels as string).split(
      ","
    );

    res.send({
      result_code: 0,
      result_msg: "get article main succeed",
      article_main: article_main,
    });
  } catch (err: any) {
    res.send({
      result_code: 1,
      result_msg: "get article main failed: " + err.message,
    });
  }
};

// 上传文章的处理函数
articleController.postArticle = (req, res) => {
  const article_body = req.body;
  const article = {
    ...article_body,
    article_major: article_body.article_major.join(","),
    article_labels: article_body.article_labels.join(","),
  };

  const sql_PostArticle = "INSERT INTO articles SET ?";
  db.query(sql_PostArticle, article, (err, results) => {
    if (err) {
      return res.send({
        result_code: 1,
        result_msg: "post article failed: " + err.message,
      });
    } else if (results.affectedRows !== 1) {
      return res.send({
        result_code: 1,
        result_msg: "results.affectedRows !== 1: " + results.affectedRows,
      });
    } else {
      return res.send({
        result_code: 0,
        result_msg: "post article succeed",
      });
    }
  });
};

// 编辑文章的处理函数
articleController.editArticle = async (req, res) => {
  try {
    const { article_id, ...update_article } = req.body;
    // 将major转换成以','分隔的字符串存储
    update_article.article_major = update_article.article_major.join(",");
    // 将labels转换成以','分隔的字符串存储
    update_article.article_labels = update_article.article_labels.join(",");
    const sql_EditArticle = "update articles set ? where article_id = ?";
    const updateResult = (await query(sql_EditArticle, [
      update_article,
      article_id,
    ])) as OkPacket;

    if (updateResult.affectedRows !== 1) {
      return res.send({
        result_code: 1,
        result_msg: "results.affectedRows = " + updateResult.affectedRows,
      });
    }

    return res.send({
      result_code: 0,
      result_msg: "edit article succeed",
    });
  } catch (err: any) {
    return res.send({
      result_code: 1,
      result_msg: "edit article failed：" + err.message,
    });
  }
};

// 删除文章的处理函数
articleController.deleteArticle = async (req, res) => {
  try {
    const target_id = req.body.article_id;
    const sql_DeleteArticle = "delete from articles where article_id=?";
    const deleteResult = (await query(
      sql_DeleteArticle,
      target_id
    )) as OkPacket;

    if (deleteResult.affectedRows !== 1) {
      return res.send({
        result_code: 1,
        result_msg:
          "delete article failed: results.affectedRows = " +
          deleteResult.affectedRows,
      });
    }

    return res.send({
      result_code: 0,
      result_msg: "delete article succeed",
    });
  } catch (err: any) {
    return res.send({
      result_code: 1,
      result_msg: "delete article failed: " + err.message,
    });
  }
};

// 新增文章标签的处理函数
articleController.addArticleLabel = (req, res) => {
  const newlabel = req.body;
  const sql_AddNewLabel = "insert into article_labels set ?";
  db.query(sql_AddNewLabel, newlabel, (err, results) => {
    if (err) {
      return res.send({
        result_code: 1,
        result_msg: "add new label failed:" + err.message,
      });
    } else if (results.affectedRows !== 1) {
      return res.send({
        result_code: 1,
        result_msg:
          "add new label failed:results.affectedRows !== 1" +
          results.affectedRows,
      });
    } else {
      return res.send({
        result_code: 0,
        result_msg: "add new label succeed",
      });
    }
  });
};

// 搜索时将搜索关键词提交给数据库后台并做记录
articleController.submitSearchKeyword = async (req, res) => {
  try {
    const keyword = req.body.keyword.toLowerCase();
    const user_id = req.body.user_id;

    const sql_SearchUserKeyword = "SELECT * FROM keywords WHERE user_id=?";
    const user_results = (await query(sql_SearchUserKeyword, [
      user_id,
    ])) as UserKeyword[];

    let flag = false;
    for (const item of user_results) {
      if (item.keywords_name === keyword) {
        flag = true;
        const sql_UpdateKeywordCount =
          "INSERT INTO keywords (keywords_name, keywords_count, user_id) VALUES (?, 1, ?) " +
          "ON DUPLICATE KEY UPDATE keywords_count = keywords_count + 1";
        await query(sql_UpdateKeywordCount, [keyword, user_id]);
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
      await query(sql_InsertNewKeyword, insertNewKeyword);
    }

    res.send({
      result_code: 0,
      result_msg: "submit keyword succeed",
    });
  } catch (err: any) {
    res.send({
      result_code: 1,
      result_msg: "submit keyword failed: " + err.message,
    });
  }
};

// 当用户在文章详情页进行书签的添加时，将该书签信息存入数据库
articleController.addBookMark = async (req, res) => {
  try {
    const new_bookmark = req.body;
    const user_id = new_bookmark.user_id;

    const sql_SelectUserBookMark =
      "SELECT * FROM article_bookmarks WHERE user_id=?";
    const bookmarks = (await query(sql_SelectUserBookMark, [
      user_id,
    ])) as Bookmark[];

    let flag = false;
    for (const item of bookmarks) {
      if (
        item.article_id === new_bookmark.article_id &&
        item.user_id === new_bookmark.user_id
      ) {
        flag = true;
        const sql_UpdateBookMark =
          "UPDATE article_bookmarks SET topHeight=? WHERE article_id=? AND user_id=?";
        await query(sql_UpdateBookMark, [
          new_bookmark.topHeight,
          new_bookmark.article_id,
          new_bookmark.user_id,
        ]);
        break;
      }
    }

    if (!flag) {
      const sql_AddBookMark = "INSERT INTO article_bookmarks SET ?";
      await query(sql_AddBookMark, new_bookmark);
    }

    res.send({
      result_code: 0,
      result_msg: flag ? "update bookmark succeed" : "add bookmark succeed",
    });
  } catch (err: any) {
    res.send({
      result_code: 1,
      result_msg: "add/update bookmark failed: " + err.message,
    });
  }
};

//获取指定用户的文章书签
articleController.getBookMark = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const sql_SelectUserBookMark =
      "select * from article_bookmarks where user_id=?";
    const results = await query(sql_SelectUserBookMark, user_id);

    return res.send({
      result_code: 0,
      result_msg: "get bookmark succeed",
      bookmarks: results,
    });
  } catch (err: any) {
    return res.send({
      result_code: 1,
      result_msg: "get bookmark failed: " + err.message,
    });
  }
};

// 移除用户添加的标签
articleController.removeBookMark = async (req, res) => {
  try {
    const bookmark_info = req.body;
    const sql_RemoveBookMark =
      "delete from article_bookmarks where article_id=? and user_id=?";
    const results = (await query(sql_RemoveBookMark, [
      bookmark_info.article_id,
      bookmark_info.user_id,
    ])) as OkPacket;

    if (results.affectedRows !== 1) {
      return res.send({
        result_code: 1,
        result_msg: "results.affectedRows = " + results.affectedRows,
      });
    }

    return res.send({
      result_code: 0,
      result_msg: "remove bookmark succeed",
    });
  } catch (err: any) {
    return res.send({
      result_code: 1,
      result_msg: "remove bookmark failed: " + err.message,
    });
  }
};

// 获取某用户的发布文章列表
articleController.getUserArticleList = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const sql_GetUserArticleList = "select * from articles where author_id = ?";
    const results = (await query(
      sql_GetUserArticleList,
      user_id
    )) as ArticleBasicInfo[];

    const user_article_list = results.map((item) => {
      const { article_details, article_md, ...article_item } = item;
      article_item.article_major = (item.article_major as string).split(",");
      article_item.article_labels = (item.article_labels as string).split(",");
      return article_item;
    });

    return res.send({
      result_code: 0,
      result_msg: "get user article list succeed",
      user_article_list: user_article_list,
    });
  } catch (err: any) {
    return res.send({
      result_code: 1,
      result_msg: "get user article list failed: " + err.message,
    });
  }
};

// 提交浏览趋势的处理函数
articleController.postArticleTrend = async (req, res) => {
  try {
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

    const addTrend = (item: string) => {
      return new Promise((resolve, reject) => {
        const sql_selectLabel = "SELECT * FROM scan_trend WHERE trend_name = ?";
        db.query(sql_selectLabel, item, (err, results) => {
          if (err) {
            reject("select label failed: " + err.message);
          } else if (results.length === 0) {
            const sql_PostArticleTrend = `INSERT INTO scan_trend (trend_name, ${month}) VALUES (?, 1)`;
            db.query(sql_PostArticleTrend, item, (err, results1) => {
              if (err) {
                reject("add trend failed: " + err.message);
              } else if (results1.affectedRows !== 1) {
                reject("results1.affectedRows = " + results1.affectedRows);
              } else {
                resolve("add trend succeed");
              }
            });
          } else {
            const sql_UpdateTrend = `UPDATE scan_trend SET ${month} = ${month} + 1 WHERE trend_name = ?`;
            db.query(sql_UpdateTrend, item, (err, results2) => {
              if (err) {
                reject("update trend failed: " + err.message);
              } else if (results2.affectedRows !== 1) {
                reject("results2.affectedRows = " + results2.affectedRows);
              } else {
                resolve("update trend succeed");
              }
            });
          }
        });
      });
    };

    // Promise.all接收一个全是Promise的数组，等待所有的Promise解析完成
    await Promise.all(label_list.map((item: string) => addTrend(item)));

    res.send({
      result_code: 0,
      result_msg: "submit trend succeed",
    });
  } catch (err: any) {
    res.send({
      result_code: 1,
      result_msg: "submit trend failed: " + err,
    });
  }
};

// 增加文章浏览量的处理函数
articleController.increaseArticleView = async (req, res) => {
  try {
    const article_id = req.body.article_id;
    const sql_IncreaseArticleView =
      "update articles set view_num = view_num + 1 where article_id = ?";
    const results = (await query(
      sql_IncreaseArticleView,
      article_id
    )) as OkPacket;

    if (results.affectedRows !== 1) {
      return res.send({
        result_code: 1,
        result_msg: "results.affectedRows = " + results.affectedRows,
      });
    }

    return res.send({
      result_code: 0,
      result_msg: "increase article view number succeed",
    });
  } catch (err: any) {
    return res.send({
      result_code: 1,
      result_msg: "increase article view number failed: " + err.message,
    });
  }
};

// 获取文章趋势的处理函数
articleController.getArticleTrend = async (_, res) => {
  try {
    const sql_GetArticleTrend = "select * from scan_trend";
    const source = (await query(sql_GetArticleTrend)) as Trend[];

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
    return res.send({
      result_code: 0,
      result_msg: "get article trend succeed",
      article_trend: topFiveTrends,
    });
  } catch (err: any) {
    res.send({
      result_code: 1,
      result_msg: "get article trend failed:" + err.message,
    });
  }
};

export default articleController;
