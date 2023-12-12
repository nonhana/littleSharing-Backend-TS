import type { Response } from "express";
import type { ReadMessageRequestBody } from "./types/index";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";

class Actions {
  // 更改指定类型的所有未读消息为已读的处理函数
  readMessage = async (req: AuthenticatedRequest, res: Response) => {
    const { type } = req.body as ReadMessageRequestBody;
    try {
      await queryPromise(
        `UPDATE messages SET status = 1 WHERE receiver_id = ? AND type = ?`,
        [req.state!.userInfo.user_id, type]
      );
      unifiedResponseBody({
        res,
        result_msg: "更改指定类型的所有未读消息为已读成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "更改指定类型的所有未读消息为已读失败",
      });
    }
  };
}

export const actions = new Actions();
