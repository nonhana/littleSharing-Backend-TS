import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../utils/index";
import type { AuthenticatedRequest } from "../middleware/user.middleware";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class UserController {
  // 上传头像
  uploadAvatar = (req: Request, res: Response) => {
    if (!req.file) {
      unifiedResponseBody({
        httpStatus: 400,
        result_code: 1,
        result_msg: "未检测到上传文件",
        res,
      });
      return;
    }
    const imgPath = `${process.env.AVATAR_PATH}/${req.file.filename}`;
    unifiedResponseBody({
      result_msg: "上传图片成功",
      result: imgPath,
      res,
    });
  };

  // 上传背景
  uploadBackground = (req: Request, res: Response) => {
    if (!req.file) {
      unifiedResponseBody({
        httpStatus: 400,
        result_code: 1,
        result_msg: "未检测到上传文件",
        res,
      });
      return;
    }
    const imgPath = `${process.env.BACKGROUND_PATH}/${req.file.filename}`;
    unifiedResponseBody({
      result_msg: "上传图片成功",
      result: imgPath,
      res,
    });
  };

  // 注册的处理函数
  register = async (req: Request, res: Response) => {
    // 1.接收表单数据(此处的userinfo含有三个属性:name,account,password)
    const { name, account, password } = req.body;
    try {
      // 2.定义sql语句，查找该账号是否被占用
      const retrieveRes = await queryPromise(
        "select * from users where account=?",
        account
      );
      if (retrieveRes.length > 0) {
        unifiedResponseBody({
          result_code: 1,
          result_msg: "该账号已被注册",
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

      // 5.返回成功响应
      unifiedResponseBody({
        result_code: 0,
        result_msg: "注册成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "注册失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 登录的处理函数
  login = async (req: Request, res: Response) => {
    // 1. 获取登录时提交的数据
    const { account, password } = req.body;
    try {
      // 2. 在数据库中查询用户所提交的账号
      const retrieveRes = await queryPromise(
        "select * from users where account = ?",
        account
      );

      // 如果账号不存在
      if (retrieveRes.length === 0) {
        unifiedResponseBody({
          result_code: 1,
          result_msg: "该账号不存在，请先进行注册",
          res,
        });
        return;
      }

      const compareRes = bcryptjs.compareSync(
        password,
        retrieveRes[0].password
      );

      if (!compareRes) {
        unifiedResponseBody({
          result_code: 1,
          result_msg: "密码错误！请重新输入",
          res,
        });
        return;
      } else {
        const {
          password,
          name,
          major,
          university,
          headphoto,
          backgroundphoto,
          signature,
          introduce,
          ...user
        } = retrieveRes[0];

        const token = jwt.sign(user, process.env.JWT_SECRET!, {
          expiresIn: "24h",
        });

        unifiedResponseBody({
          result_code: 0,
          result_msg: "登录成功",
          result: token,
          res,
        });
      }
    } catch (error) {
      errorHandler({
        error,
        result_msg: "登录失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户的keywords
  getUserKeywords = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // 获取该用户的keywords
      const keywords = await queryPromise(
        "select keywords_name, keywords_count from keywords where user_id = ?",
        req.state!.userInfo.user_id
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
  getArticleLabels = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // 获取全局的article_labels
      const labels = await queryPromise(
        "select label_name as label from article_labels"
      );
      labels.forEach((item: any) => {
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

  // 获取用户的信息
  getUserInfo = async (req: AuthenticatedRequest, res: Response) => {
    const { user_id } = req.query;
    try {
      let retrieveRes = null;
      // 有id，通过id获取；无id，通过解析token获取
      if (user_id) {
        retrieveRes = await queryPromise(
          "select * from users where user_id = ?",
          user_id
        );
      } else {
        retrieveRes = await queryPromise(
          "select * from users where user_id = ?",
          req.state!.userInfo.user_id
        );
      }

      const { password, ...userInfo } = retrieveRes[0];

      unifiedResponseBody({
        result_msg: "获取用户信息成功",
        result: userInfo,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取用户信息失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 提交更新表单，更新某一用户的用户信息
  editUserInfo = async (req: Request, res: Response) => {
    const { user_id, ...newUserInfo } = req.body;
    try {
      const newMajor = newUserInfo.major.join(",");
      await queryPromise(
        "update users set name = ?, major = ?, university = ?, headphoto = ?, backgroundphoto = ?, signature = ?, introduce = ? where user_id = ?",
        [
          newUserInfo.name,
          newMajor,
          newUserInfo.university,
          newUserInfo.headphoto,
          newUserInfo.backgroundphoto,
          newUserInfo.signature,
          newUserInfo.introduce,
          user_id,
        ]
      );
      unifiedResponseBody({
        result_msg: "更新用户信息成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "更新用户信息失败",
        result: {
          error,
        },
        res,
      });
    }
  };

  // 获取用户发布文章的总点赞数
  getUserLikeNum = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "select like_num from articles where author_id = ?",
        user_id
      );
      let total_like_num = 0;
      retrieveRes.forEach((item: any) => {
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
      const retrieveRes = await queryPromise(
        "select collection_num from articles where author_id = ?",
        user_id
      );
      let total_collection_num = 0;
      retrieveRes.forEach((item: any) => {
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
  getLikedArticles = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const retrieveRes = await queryPromise(
        "select * from article_like where article_id in (select article_id from articles where author_id = ? )",
        req.state!.userInfo.user_id
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
  getCollectedArticles = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const retrieveRes = await queryPromise(
        "select * from article_collect where article_id in (select article_id from articles where author_id = ?)",
        req.state!.userInfo.user_id
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

  // 用户关注操作
  focusUserActions = async (req: Request, res: Response) => {
    const { action_type, ...focus_info } = req.body;
    try {
      if (action_type == 0) {
        await queryPromise("insert into user_focus set ?", focus_info);
        unifiedResponseBody({
          result_msg: "关注操作成功",
          res,
        });
      } else {
        await queryPromise(
          "delete from user_focus where first_user_id = ? and second_user_id = ?",
          [focus_info.first_user_id, focus_info.second_user_id]
        );
        unifiedResponseBody({
          result_msg: "取消关注操作成功",
          res,
        });
      }
    } catch (error) {
      errorHandler({
        error,
        result_msg: "关注操作失败",
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
      const retrieveRes = await queryPromise(
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
      const retrieveRes = await queryPromise(
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
      const retrieveRes = await queryPromise(
        "select article_labels from articles where author_id = ?",
        user_id
      );
      // 2. 对用户发布的文章标签进行统计
      let source_data = retrieveRes.map((item: any) => item.article_labels);
      function countOccurrences(arr: any[]) {
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

  // 用户点赞的处理函数
  addLike = async (req: AuthenticatedRequest, res: Response) => {
    const { article_id, action_type } = req.body;
    try {
      if (action_type === 0) {
        const retrieveRes = await queryPromise(
          "select article_id from article_like where user_id = ?",
          req.state!.userInfo.user_id
        );

        if (retrieveRes.some((item: any) => item.article_id === article_id)) {
          unifiedResponseBody({
            result_msg: "已经点赞过该文章",
            res,
          });
          return;
        }

        await queryPromise("insert into article_like set ?", {
          article_id,
          user_id: req.state!.userInfo.user_id,
        });

        unifiedResponseBody({
          result_msg: "点赞成功",
          res,
        });
      } else if (action_type === 1) {
        await queryPromise(
          "delete from article_like where article_id = ? and user_id = ?",
          [article_id, req.state!.userInfo.user_id]
        );
        unifiedResponseBody({
          result_msg: "取消点赞成功",
          res,
        });
      } else {
        unifiedResponseBody({
          httpStatus: 400,
          result_code: 1,
          result_msg: "非法的操作符",
          res,
        });
      }
    } catch (error) {
      errorHandler({
        error,
        res,
        result: {
          error,
        },
        result_msg: "点赞失败",
      });
    }
  };

  // 获取用户的点赞列表
  getUserLikeList = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const retrieveRes = await queryPromise(
        "select article_id from article_like where user_id=?",
        req.state!.userInfo.user_id
      );

      const like_list = retrieveRes.map((item: any) => item.article_id);

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

  // 用户收藏的处理函数
  addCollect = async (req: AuthenticatedRequest, res: Response) => {
    const { article_id, action_type } = req.body;
    try {
      if (action_type === 0) {
        const retrieveRes = await queryPromise(
          "select article_id from article_collect where user_id=?",
          req.state!.userInfo.user_id
        );

        if (retrieveRes.some((item: any) => item.article_id === article_id)) {
          unifiedResponseBody({
            result_msg: "已经收藏过该文章",
            res,
          });
          return;
        }

        await queryPromise("insert into article_collect set ?", {
          article_id,
          user_id: req.state!.userInfo.user_id,
        });

        unifiedResponseBody({
          result_msg: "收藏成功",
          res,
        });
      } else if (action_type === 1) {
        await queryPromise(
          "delete from article_collect where article_id=? and user_id=?",
          [article_id, req.state!.userInfo.user_id]
        );
        unifiedResponseBody({
          result_msg: "取消收藏成功",
          res,
        });
      } else {
        unifiedResponseBody({
          httpStatus: 400,
          result_code: 1,
          result_msg: "非法操作符",
          res,
        });
      }
    } catch (error) {
      errorHandler({
        error,
        res,
        result: {
          error,
        },
        result_msg: "收藏失败",
      });
    }
  };

  // 获取用户的收藏列表
  getUserCollectList = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const retrieveRes = await queryPromise(
        "select article_id from article_collect where user_id=?",
        req.state!.userInfo.user_id
      );

      const collect_list = retrieveRes.map((item: any) => item.article_id);

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
}

export const userController = new UserController();
