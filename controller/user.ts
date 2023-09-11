import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../utils/index";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

class UserController {
  // 注册的处理函数
  register = async (req: Request, res: Response) => {
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

      // 5.返回成功响应
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
  login = async (req: Request, res: Response) => {
    try {
      // 1. 获取登录时提交的数据
      const { account, password } = req.query;

      // 2. 在数据库中查询用户所提交的账号
      const retrieveRes = await queryPromise(
        "select * from users where account=?",
        account
      );

      const compareRes = bcryptjs.compareSync(
        password as string,
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
        // 如果输入正确，则生成 JWT token 字符串返回给客户端
        // 先剔除除了id和account以外的任何值
        const user = {
          ...retrieveRes[0],
          password: "",
          name: "",
          major: "",
          university: "",
          headphoto: "",
          backgroundphoto: "",
          signature: "",
          introduce: "",
        };
        const token = jwt.sign(user, "littleSharing", { expiresIn: "24h" });

        // 获取该用户的keywords
        const keyword_results = await queryPromise(
          "select keywords_name,keywords_count from keywords where user_id=?",
          user.id
        );
        // 获取全局的article_labels
        const label_results = await queryPromise(
          "select label_name as label from article_labels"
        );
        label_results.forEach((item: any) => {
          item.value = item.label;
        });
        unifiedResponseBody({
          result_code: 0,
          result_msg: "login succeed",
          result: {
            token,
            keywords_list: keyword_results,
            article_labels: label_results,
            user_info: { ...retrieveRes[0], password: null },
          },
          res,
        });
      }
    } catch (error) {
      errorHandler({ error, result_msg: "登录失败", res });
    }
  };

  // 根据user_id获取某个具体登录用户的信息
  getUserInfo = async (req: Request, res: Response) => {
    const { user_id: origin_user_id } = req.query;
    try {
      let retrieveRes = null;
      if (origin_user_id) {
        retrieveRes = await queryPromise(
          "select * from users where id=?",
          origin_user_id
        );
      } else {
        retrieveRes = await queryPromise(
          "select * from users where id=?",
          (<any>req).state.userInfo.user_id
        );
      }

      const { password, ...userInfo } = retrieveRes[0];

      unifiedResponseBody({
        result_msg: "获取用户信息成功",
        result: { userInfo },
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "获取用户信息失败", res });
    }
  };

  // 提交更新表单，更新某一用户的用户信息
  editUserInfo = async (req: Request, res: Response) => {
    const { id, ...newUserInfo } = req.body;
    try {
      const newMajor = newUserInfo.major.join(",");
      await queryPromise(
        "update users set name=?,major=?,university=?,headphoto=?,backgroundphoto=?,signature=?,introduce=? where id=?",
        [
          newUserInfo.name,
          newMajor,
          newUserInfo.university,
          newUserInfo.headphoto,
          newUserInfo.backgroundphoto,
          newUserInfo.signature,
          newUserInfo.introduce,
          id,
        ]
      );
      unifiedResponseBody({
        result_msg: "更新用户信息成功",
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "更新用户信息失败", res });
    }
  };

  // 获取用户发布文章的总点赞数
  getUserLikeNum = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "select like_num from articles where author_id=?",
        user_id
      );
      let total_like_num = 0;
      retrieveRes.forEach((item: any) => {
        total_like_num += item.like_num;
      });
      unifiedResponseBody({
        result_msg: "获取用户点赞数成功",
        result: { like_num: total_like_num },
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "获取用户点赞数失败", res });
    }
  };

  // 获取用户发布文章的总收藏数
  getUserCollectionNum = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "select collection_num from articles where author_id=?",
        user_id
      );
      let total_collection_num = 0;
      retrieveRes.forEach((item: any) => {
        total_collection_num += item.collection_num;
      });
      unifiedResponseBody({
        result_msg: "获取用户收藏数成功",
        result: { collection_num: total_collection_num },
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "获取用户收藏数失败", res });
    }
  };

  // 获取用户的被点赞文章数据
  getLikedArticles = async (req: Request, res: Response) => {
    const { user_id: author_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "select * from article_like where article_id in (select article_id from articles where author_id = ? )",
        author_id
      );
      unifiedResponseBody({
        result_msg: "获取用户点赞文章成功",
        result: { liked_articles: retrieveRes },
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "获取用户点赞文章失败", res });
    }
  };

  // 获取用户的被收藏文章数据
  getCollectedArticles = async (req: Request, res: Response) => {
    const { user_id: author_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "select * from article_collect where article_id in (select article_id from articles where author_id = ?)",
        author_id
      );
      unifiedResponseBody({
        result_msg: "获取用户收藏文章成功",
        result: { collected_articles: retrieveRes },
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "获取用户收藏文章失败", res });
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
      errorHandler({ error, result_msg: "关注操作失败", res });
    }
  };

  // 获取用户关注列表
  getUserFocusList = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "select * from user_focus where first_user_id = ?",
        user_id
      );
      unifiedResponseBody({
        result_msg: "获取用户关注列表成功",
        result: { focus_list: retrieveRes },
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "获取用户关注列表失败", res });
    }
  };

  // 获取用户粉丝列表
  getUserFansList = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes = await queryPromise(
        "select * from user_foc----us where second_user_id = ?",
        user_id
      );
      unifiedResponseBody({
        result_msg: "获取用户粉丝列表成功",
        result: { fans_list: retrieveRes },
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "获取用户粉丝列表失败", res });
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
        result: { article_tags: resultArray },
        res,
      });
    } catch (error) {
      errorHandler({ error, result_msg: "获取用户文章标签列表失败", res });
    }
  };
}

export const userController = new UserController();
