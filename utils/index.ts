import db from "../database/index";
import { QueryOptions } from "mysql";
import { Response } from "express";

interface UnifiedResponseBodyParams {
  httpStatus?: number;
  result_code?: 0 | 1; // 0-成功, 1-失败
  result_msg: string;
  result?: any;
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

// 获取文章详情中的图片链接
export const getImgSrc = (htmlstr: string) => {
  const reg = /<img.+?src=('|")?([^'"]+)('|")?(?:\s+|>)/gim;
  const arr = [];
  let tem;
  while ((tem = reg.exec(htmlstr))) {
    arr.push(tem[2]);
  }
  return arr;
};

// 打乱数组
export const shuffle = (arr: any[]) => {
  let currentIndex = arr.length,
    randomIndex;

  // 当还剩有元素未洗牌时
  while (currentIndex !== 0) {
    // 选取剩余元素中的一个随机索引
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // 交换当前元素与随机选取的元素
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }

  return arr;
};
