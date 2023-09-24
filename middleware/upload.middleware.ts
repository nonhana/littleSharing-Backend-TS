import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/index";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

// 控制图片上传报错的中间件
export const imgUploadError = (
  error: Error,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    errorHandler({
      error,
      httpStatus: 400,
      result_msg: error.message,
      res,
    });
  } else {
    errorHandler({
      error,
      httpStatus: 400,
      result_msg: error.message,
      res,
    });
  }
};
