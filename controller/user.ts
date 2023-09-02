import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../utils/index";
import db from "../database/index";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

class UserController {
  // 注册的处理函数
  regUser = async (req: Request, res: Response) => {
    try {
      // 1.接收表单数据(此处的userinfo含有三个属性:name,account,password)
      const { name, account, password } = req.body;
      // 2.定义sql语句，查找该账号是否被占用
      const retrieveRes = await queryPromise(
        "select * from users where account=?",
        account
      );
      if (retrieveRes.length > 0) {
        unifiedResponseBody({
          result_code: 1,
          result_msg: "this account has been occupied",
          res,
        });
        return;
      }
      // 3. 若当前用户名可用，调用bcryptjs加密密码
      const salt = bcryptjs.genSaltSync(10);
      const passwordEncrypted = bcryptjs.hashSync(password, salt);
      // 4.定义插入用户的SQL语句
      await queryPromise("insert into users set ?", {
        name,
        account,
        password: passwordEncrypted,
      });
      // 5.返回成功的响应
      unifiedResponseBody({
        result_code: 0,
        result_msg: "register succeed",
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "注册失败", res });
    }
  };

  // 登录的处理函数
  login = (req: Request, res: Response) => {
    // 获取登录时提交的数据
    const userinfo = req.query;
    // 在数据库中查询用户所提交的账号
    const sql_Login = "select * from users where account=?";
    db.query(sql_Login, userinfo.account, (err, userinfo_results) => {
      if (err)
        return res.send({
          result_code: 1,
          result_msg: err,
        });
      if (userinfo_results.length !== 1)
        return res.send({
          result_code: 1,
          result_msg: "login failed",
          result_length: userinfo_results.length,
        });
      const compareResult = bcryptjs.compareSync(
        userinfo.password as string,
        userinfo_results[0].password
      );
      if (!compareResult) {
        return res.send({
          result_code: 1,
          result_msg: "密码错误！请重新输入",
        });
      } else {
        // 如果输入正确，则生成 JWT token 字符串返回给客户端
        // 先剔除除了id和account以外的任何值
        const user = {
          ...userinfo_results[0],
          password: "",
          name: "",
          major: "",
          university: "",
          headphoto: "",
          backgroundphoto: "",
          signature: "",
          introduce: "",
        };
        const token = jwt.sign(user, config.secretKey, { expiresIn: "24h" });
        // 获取该用户的keywords
        const sql_GetKeywords =
          "select keywords_name,keywords_count from keywords where user_id=?";
        db.query(sql_GetKeywords, user.id, (err, keyword_results) => {
          if (err) {
            return res.send({
              result_code: 1,
              result_msg: "get keywords failed:" + err.message,
            });
          } else {
            // 获取全局的article_labels
            const sql_GetArticleLabels =
              "select label_name as label from article_labels";
            db.query(sql_GetArticleLabels, (err, label_results) => {
              if (err) {
                return res.send({
                  result_code: 1,
                  result_msg: "get article_labels failed:" + err.message,
                });
              } else {
                label_results.forEach((item: any) => {
                  item.value = item.label;
                });
                res.send({
                  result_code: 0,
                  result_msg: "login succeed",
                  token: "Bearer " + token,
                  keywords_list: keyword_results,
                  user_info: { ...userinfo_results[0], password: null },
                  article_labels: label_results,
                });
              }
            });
          }
        });
      }
    });
  };

  // 根据user_id获取某个具体登录用户的信息
  getUserInfo = (req: Request, res: Response) => {
    const user_id = req.query.user_id;
    const sql_SelectUserInfo = "select * from users where id=?";
    db.query(sql_SelectUserInfo, user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "get userinfo failed:" + err.message,
        });
      } else if (results.length != 1) {
        return res.send({
          result_code: 1,
          result_msg:
            "get userinfo failed:results.length != 1   " + results.length,
        });
      } else {
        let { password, ...user_info } = results[0];
        return res.send({
          result_code: 0,
          result_msg: "get userinfo succeed",
          user_info: user_info,
        });
      }
    });
  };

  // 提交更新表单，更新某一用户的用户信息
  editUserInfo = (req: Request, res: Response) => {
    const { id, ...newUserInfo } = req.body;
    newUserInfo.major = newUserInfo.major.join(",");
    const sql_EditUserInfo =
      "update users set name=?,major=?,university=?,headphoto=?,backgroundphoto=?,signature=?,introduce=? where id=?";
    db.query(
      sql_EditUserInfo,
      [
        newUserInfo.name,
        newUserInfo.major,
        newUserInfo.university,
        newUserInfo.headphoto,
        newUserInfo.backgroundphoto,
        newUserInfo.signature,
        newUserInfo.introduce,
        id,
      ],
      (err, results) => {
        if (err) {
          return res.send({
            result_code: 1,
            result_msg: "update user's info failed!：" + err.message,
          });
        } else if (results.affectedRows !== 1) {
          return res.send({
            result_code: 1,
            result_msg: "results.affectedRows=" + results.affectedRows,
          });
        } else {
          return res.send({
            result_code: 0,
            result_msg: "update user's info succeed",
          });
        }
      }
    );
  };

  // 获取用户发布文章的总点赞数
  getUserLikeNum = (req: Request, res: Response) => {
    const user_id = req.query.user_id;
    const sql_GetUserArticleList =
      "select like_num from articles where author_id = ?";
    db.query(sql_GetUserArticleList, user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "get user like num failed：" + err.message,
        });
      } else {
        let total_like_num = 0;
        results.forEach((item: any) => {
          total_like_num += item.like_num;
        });
        return res.send({
          result_code: 0,
          result_msg: "get user like num succeed",
          like_num: total_like_num,
        });
      }
    });
  };

  // 获取用户发布文章的总收藏数
  getUserCollectionNum = (req: Request, res: Response) => {
    const user_id = req.query.user_id;
    const sql_GetUserArticleList =
      "select collection_num from articles where author_id = ?";
    db.query(sql_GetUserArticleList, user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "get user collection num failed：" + err.message,
        });
      } else {
        let total_collection_num = 0;
        results.forEach((item: any) => {
          total_collection_num += item.collection_num;
        });
        return res.send({
          result_code: 0,
          result_msg: "get user collection num succeed",
          collection_num: total_collection_num,
        });
      }
    });
  };

  // 获取用户的被点赞文章数据
  getUserAddLike = (req: Request, res: Response) => {
    const author_id = req.query.user_id;
    const sql_GetUserAddLike =
      "select * from article_like where article_id in (select article_id from articles where author_id = ? )";
    db.query(sql_GetUserAddLike, author_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "get user liked articles failed：" + err.message,
        });
      } else {
        return res.send({
          result_code: 0,
          result_msg: "get user liked articles succeed",
          liked_articles: results,
        });
      }
    });
  };

  // 获取用户的被收藏文章数据
  getUserAddCollection = (req: Request, res: Response) => {
    const author_id = req.query.user_id;
    const sql_GetUserAddCollection =
      "select * from article_collect where article_id in (select article_id from articles where author_id = ?)";
    db.query(sql_GetUserAddCollection, author_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "get user collected articles failed：" + err.message,
        });
      } else {
        return res.send({
          result_code: 0,
          result_msg: "get user collected articles succeed",
          collected_articles: results,
        });
      }
    });
  };

  // 用户关注操作
  focusUserActions = (req: Request, res: Response) => {
    const { action_type, ...focus_info } = req.body;
    if (action_type == 0) {
      const sql_focusUserActions = "insert into user_focus set ?";
      db.query(sql_focusUserActions, focus_info, (err, results) => {
        if (err) {
          return res.send({
            result_code: 1,
            result_msg: "add focus failed：" + err.message,
          });
        } else {
          return res.send({
            result_code: 0,
            result_msg: "add focus succeed",
          });
        }
      });
    } else {
      const sql_focusUserActions =
        "delete from user_focus where first_user_id = ? and second_user_id = ?";
      db.query(
        sql_focusUserActions,
        [focus_info.first_user_id, focus_info.second_user_id],
        (err, results) => {
          if (err) {
            return res.send({
              result_code: 1,
              result_msg: "delete focus failed：" + err.message,
            });
          } else {
            return res.send({
              result_code: 0,
              result_msg: "delete focus succeed",
            });
          }
        }
      );
    }
  };

  // 获取用户关注列表
  getUserFocusList = (req: Request, res: Response) => {
    const user_id = req.query.user_id;
    const sql_getUserFocusList =
      "select second_user_id from user_focus where first_user_id = ?";
    db.query(sql_getUserFocusList, user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "get user focus list failed:" + err.message,
        });
      } else {
        let user_focus_list: any[] = [];
        results.forEach((item: any) => {
          user_focus_list.push(item.second_user_id);
        });
        return res.send({
          result_code: 0,
          result_msg: "get user focus list succeeded",
          user_focus_list: user_focus_list,
        });
      }
    });
  };

  // 获取用户粉丝列表
  getUserFansList = (req: Request, res: Response) => {
    const user_id = req.query.user_id;
    const sql_getUserFansList =
      "select first_user_id from user_focus where second_user_id = ?";
    db.query(sql_getUserFansList, user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "get user fans list failed:" + err.message,
        });
      } else {
        let user_fans_list: any[] = [];
        results.forEach((item: any) => {
          user_fans_list.push(item.first_user_id);
        });
        return res.send({
          result_code: 0,
          result_msg: "get user fans list succeeded",
          user_fans_list: user_fans_list,
        });
      }
    });
  };

  // 获取用户发布的文章标签列表
  getUserArticleTags = (req: Request, res: Response) => {
    const user_id = req.query.user_id;
    const sql_GetUserArticleList = "select * from articles where author_id = ?";
    db.query(sql_GetUserArticleList, user_id, (err, results) => {
      if (err) {
        return res.send({
          result_code: 1,
          result_msg: "get user article tags failed：" + err.message,
        });
      } else {
        let source_data = results.map((item: any) => item.article_labels);
        function countOccurrences(arr: any) {
          const counts: {
            [key: string]: number;
          } = {};
          for (let i = 0; i < arr.length; i++) {
            const items = arr[i].split(",");
            for (let j = 0; j < items.length; j++) {
              const item = items[j].trim();
              if (item in counts) {
                counts[item]++;
              } else {
                counts[item] = 1;
              }
            }
          }
          return counts;
        }
        const counts = countOccurrences(source_data);
        const sortedCounts = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        const resultArray = sortedCounts.map(([tag_name, count]) => ({
          tag_name,
          count,
        }));
        return res.send({
          result_code: 0,
          result_msg: "get user article tags succeed",
          article_tags: resultArray,
        });
      }
    });
  };
}

export const userController = new UserController();
