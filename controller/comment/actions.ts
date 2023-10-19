import { Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";

class Actions {
  // 评论点赞相关操作
  commentLikeAction = async (req: AuthenticatedRequest, res: Response) => {
    const { comment_id, action_type } = req.body;
    try {
      if (action_type === 0) {
        // 添加评论点赞
        await queryPromise("insert into comment_like set ?", {
          comment_id,
          user_id: req.state!.userInfo.user_id,
        });
        unifiedResponseBody({
          result_msg: "评论点赞成功",
          res,
        });
      } else if (action_type === 1) {
        // 删除评论点赞
        await queryPromise(
          "delete from comment_like where comment_id = ? and user_id = ?",
          [comment_id, req.state!.userInfo.user_id]
        );
        unifiedResponseBody({
          result_msg: "删除评论点赞成功",
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
        result: { error },
        result_msg: "评论点赞失败",
      });
    }
  };
}

export const actions = new Actions();
