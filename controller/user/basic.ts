import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";
import type {
  User,
  RegisterRequestBody,
  LoginRequestBody,
  EditUserInfoRequestBody,
} from "./types";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class Basic {
  // 注册的处理函数
  register = async (req: Request, res: Response) => {
    // 1.接收表单数据(此处的userinfo含有三个属性:name,account,password)
    const { name, account, password } = req.body as RegisterRequestBody;
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
    const { account, password } = req.body as LoginRequestBody;
    try {
      // 2. 在数据库中查询用户所提交的账号
      const retrieveRes: User[] = await queryPromise(
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

      // 比对密码
      if (!bcryptjs.compareSync(password, retrieveRes[0].password)) {
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
          expiresIn: "30d", // token有效期为30天
        });

        unifiedResponseBody({
          result_code: 0,
          result_msg: "登录成功",
          result: { token, user_id: user.user_id },
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

  // 获取某用户的信息
  getUserInfo = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes: User[] = await queryPromise(
        "select * from users where user_id = ?",
        user_id
      );
      const { password, ...userInfo } = retrieveRes[0];

      const result = {
        ...userInfo,
        major: userInfo.major.split(","),
      };

      unifiedResponseBody({
        result_msg: "获取用户信息成功",
        result,
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
    const { user_id, ...newUserInfo } = req.body as EditUserInfoRequestBody;
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
}

export const basic = new Basic();
