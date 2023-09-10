import db from "../database/index";
import { QueryOptions } from "mysql";
import { Response } from "express";

interface UnifiedResponseBodyParams {
  httpStatus?: number;
  result_code?: 0 | 1; // 0-成功, 1-失败
  result_msg: string;
  result?: object;
  res: Response;
}

interface ErrorHandlerParams {
  error: any;
  httpStatus?: number;
  result_msg: string;
  result?: object;
  res: Response;
}

// 判断客户端传递的参数是否包含必须的参数
export const getMissingParam = (
  requireParams: string[],
  paramsFromClient: object
) => {
  const paramsFromClientKeys = Object.keys(paramsFromClient);

  for (const param of requireParams) {
    if (!paramsFromClientKeys.includes(param)) return param;
  }
};

// 使用Promise封装数据库查询，方便使用async/await来取出查询结果
export const queryPromise = (
  options: string | QueryOptions,
  values?: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (values) {
      db.query(options, values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    } else {
      db.query(options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    }
  });
};

// 成功返回响应体
export const unifiedResponseBody = ({
  httpStatus = 200,
  result_code = 0,
  result_msg,
  result = {},
  res,
}: UnifiedResponseBodyParams): void => {
  res.status(httpStatus).json({
    result_code,
    result_msg,
    result,
  });
};

export const errorHandler = ({
  error,
  httpStatus = 500,
  result_msg,
  result = {},
  res,
}: ErrorHandlerParams): void => {
  unifiedResponseBody({
    httpStatus,
    result_code: 1,
    result_msg,
    result,
    res,
  });
};

export const paramsErrorHandler = (result: object, res: Response) => {
  unifiedResponseBody({
    httpStatus: 400,
    result_code: 1,
    result_msg: "参数错误",
    result,
    res,
  });
};
