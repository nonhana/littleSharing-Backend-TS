import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { unifiedResponseBody, errorHandler } from "../utils/index";

interface AuthenticatedRequest extends Request {
  state?: {
    userInfo?: any;
  };
}

export const auth: any = async (
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

  // 如果前端发的请求带了 token，就验证 token
  try {
    req.state = {};
    req.state.userInfo = jwt.verify(token, "apiPlayer");
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      errorHandler({ error, httpStatus: 401, result_msg: "token 已过期", res });
    } else {
      errorHandler({ error, httpStatus: 401, result_msg: "无效的 token", res });
    }
    return;
  }
  next();
};
