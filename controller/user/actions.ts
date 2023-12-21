import { Request, Response } from "express";
import fs from "fs";
import COS from "cos-nodejs-sdk-v5";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
  uploadFileToCos,
} from "../../utils/index";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";
import type {
  FocusUserActionsRequestBody,
  AddLikeRequestBody,
  AddCollectRequestBody,
} from "./types";
import dotenv from "dotenv";
dotenv.config();

class Actions {
  // 上传头像的处理函数
  uploadAvatar = async (req: Request, res: Response) => {
    if (!req.file) {
      unifiedResponseBody({
        httpStatus: 400,
        result_code: 1,
        result_msg: "未检测到上传文件",
        res,
      });
      return;
    }

    const filePath = req.file.path;
    const targetPath =
      "images" + filePath.split("avatars")[1].replace(/\\/g, "/");

    try {
      const result = await uploadFileToCos(filePath, targetPath);
      unifiedResponseBody({
        result_msg: "上传成功",
        result,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "上传失败",
        result: { error },
        res,
      });
    }
  };

  // 上传背景的处理函数
  uploadBackground = async (req: Request, res: Response) => {
    if (!req.file) {
      unifiedResponseBody({
        httpStatus: 400,
        result_code: 1,
        result_msg: "未检测到上传文件",
        res,
      });
      return;
    }

    const filePath = req.file.path;
    const targetPath =
      "images" + filePath.split("backgrounds")[1].replace(/\\/g, "/");
    try {
      const result = await uploadFileToCos(filePath, targetPath);
      unifiedResponseBody({
        result_msg: "上传成功",
        result,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "上传失败",
        result: { error },
        res,
      });
    }
  };

  // 用户关注的处理函数
  focusUserActions = async (req: Request, res: Response) => {
    const { action_type, ...focus_info } =
      req.body as FocusUserActionsRequestBody;
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

  // 用户点赞的处理函数
  addLike = async (req: AuthenticatedRequest, res: Response) => {
    const { article_id, action_type } = req.body as AddLikeRequestBody;
    try {
      if (action_type === 0) {
        const retrieveRes: { article_id: number }[] = await queryPromise(
          "select article_id from article_like where user_id = ?",
          req.state!.userInfo!.user_id
        );

        if (retrieveRes.some((item) => item.article_id === article_id)) {
          unifiedResponseBody({
            result_msg: "已经点赞过该文章",
            res,
          });
          return;
        }

        await queryPromise("insert into article_like set ?", {
          article_id,
          user_id: req.state!.userInfo!.user_id,
        });

        unifiedResponseBody({
          result_msg: "点赞成功",
          res,
        });
      } else if (action_type === 1) {
        await queryPromise(
          "delete from article_like where article_id = ? and user_id = ?",
          [article_id, req.state!.userInfo!.user_id]
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

  // 用户收藏的处理函数
  addCollect = async (req: AuthenticatedRequest, res: Response) => {
    const { article_id, action_type } = req.body as AddCollectRequestBody;
    try {
      if (action_type === 0) {
        const retrieveRes: { article_id: number }[] = await queryPromise(
          "select article_id from article_collect where user_id=?",
          req.state!.userInfo!.user_id
        );

        if (retrieveRes.some((item) => item.article_id === article_id)) {
          unifiedResponseBody({
            result_msg: "已经收藏过该文章",
            res,
          });
          return;
        }

        await queryPromise("insert into article_collect set ?", {
          article_id,
          user_id: req.state!.userInfo!.user_id,
        });

        unifiedResponseBody({
          result_msg: "收藏成功",
          res,
        });
      } else if (action_type === 1) {
        await queryPromise(
          "delete from article_collect where article_id=? and user_id=?",
          [article_id, req.state!.userInfo!.user_id]
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
}

export const actions = new Actions();
