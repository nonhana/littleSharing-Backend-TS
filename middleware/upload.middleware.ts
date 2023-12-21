import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../utils/index";
import multer from "multer";
import fs from "fs";
import COS from "cos-nodejs-sdk-v5";
import dotenv from "dotenv";
dotenv.config();

// 头像上传
export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/uploads/images/avatars");
    },
    filename(_, file, cb) {
      cb(
        null,
        `${Date.now()}_${Math.floor(Math.random() * 1e9)}.${
          file.mimetype.split("/")[1]
        }`
      );
    },
  }),
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 定义允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持jpg和png格式的图片，请重新上传"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 限制最大图片5MB
  },
});

// 背景上传
export const backgroundUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/uploads/images/backgrounds");
    },
    filename(_, file, cb) {
      cb(
        null,
        `${Date.now()}_${Math.floor(Math.random() * 1e9)}.${
          file.mimetype.split("/")[1]
        }`
      );
    },
  }),
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 定义允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持jpg和png格式的图片，请重新上传"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 限制最大图片5MB
  },
});

// 文章图片上传
export const articleImgUpload = multer({
  storage: multer.diskStorage({
    destination(_, __, cb) {
      cb(null, "public/uploads/images/article-imgs");
    },
    filename(_, file, cb) {
      cb(
        null,
        `${Date.now()}_${Math.floor(Math.random() * 1e9)}.${
          file.mimetype.split("/")[1]
        }`
      );
    },
  }),
  fileFilter: (_, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // 定义允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("仅支持jpg和png格式的图片，请重新上传"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 限制最大图片5MB
  },
});

// 控制上传报错的中间件
export const uploadError = (
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

// 将req.body中的content写入到.md文件中，并返回该文件的路径
export const getMDFilePath = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { article_md } = req.body; // 获取表单中的文章内容
  try {
    // 确保MD_PATH环境变量存在且有效
    if (!process.env.MD_PATH) {
      throw new Error("MD_PATH环境变量未设置或无效");
    }

    // 生成文件名。命名规则为：时间戳_随机数.md
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1e9)}.md`;
    // 构建完整的文件路径
    const filePath = `${process.env.MD_PATH}/${fileName}`;

    // 将内容写入.md文件
    await fs.promises.writeFile(filePath, article_md, "utf-8");

    // 将文件路径保存到req.body中
    req.body.filePath = filePath;

    next();
  } catch (error) {
    errorHandler({
      error,
      result_msg: "保存失败",
      result: { error },
      res,
    });
  }
};

// 保存文章内容至腾讯云COS，并返回该文章的链接
export const saveMDFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 上一个中间件saveArticleContent中已经将文件路径存入req.body，接下来只用读取该文件并上传至腾讯云COS即可
  const { filePath } = req.body;

  const cos = new COS({
    SecretId: process.env.COS_SECRETID!,
    SecretKey: process.env.COS_SECRETKEY!,
  });

  // 腾讯云 文件上传
  cos.putObject(
    {
      Bucket: process.env.COS_BUCKET! /* 必须 */,
      Region: "ap-shanghai" /* 必须 */,
      Key: "markdowns" + filePath.split("markdowns")[1] /* 必须 */,
      Body: fs.createReadStream(filePath) /* 必须 */,
      ContentLength: fs.statSync(filePath).size,
    },
    (error, data) => {
      if (error) {
        errorHandler({
          error,
          result_msg: "保存失败",
          result: { error },
          res,
        });
      } else {
        // 将保存成功的路径保存至req.body中
        req.body.article_md_link = "https://" + data.Location;
        // 保存成功后，删除本地的.md文件，清空表单的article_md字段，剔除filePath字段
        fs.unlinkSync(filePath);
        req.body.article_md = "";
        delete req.body.filePath;

        next();
      }
    }
  );
};
