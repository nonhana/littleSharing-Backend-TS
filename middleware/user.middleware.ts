import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { unifiedResponseBody, errorHandler } from "../utils/index";
import dotenv from "dotenv";
dotenv.config();

// 将 Request 接口扩展，增加 state 属性，存储用户信息
export interface AuthenticatedRequest extends Request {
  state?: {
    userInfo?: any;
  };
}

// 编写一个中间件，用于验证用户是否登录
export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { headers } = req;
  const { authorization } = headers;

  // 此处直接预置了Bearer，不用加了
  const token = (authorization as string)?.replace("Bearer ", "");

  if (!token) {
    unifiedResponseBody({
      httpStatus: 401,
      result_code: 1,
      result_msg: "缺少 token",
      res,
    });
    return;
  }

  // 如果前端发的请求带了 token，就验证 token，将用户信息存储到 state 中
  try {
    req.state = {};
    req.state.userInfo = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      errorHandler({
        error,
        httpStatus: 401,
        result_msg: "登录过期，请重新登录",
        res,
      });
    } else {
      errorHandler({
        error,
        httpStatus: 401,
        result_msg: "该token无效，请重新登录",
        res,
      });
    }
    return;
  }
  next();
};
