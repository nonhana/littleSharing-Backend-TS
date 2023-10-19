import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";

class OtherData {
  // 获取用户的评论点赞列表
  getCommentLikeList = (req: AuthenticatedRequest, res: Response) => {
    try {
      const retrieveRes = queryPromise(
        "select comment_id from comment_like where user_id = ?",
        req.state!.userInfo.user_id
      );

      unifiedResponseBody({
        result_msg: "获取评论点赞列表成功",
        result: retrieveRes,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        res,
        result: { error },
        result_msg: "获取评论点赞列表失败",
      });
    }
  };
}

export const otherData = new OtherData();
