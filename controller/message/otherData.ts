import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";

class OtherData {
  // 获取所有类型的未读消息的数量的处理函数
  getUnreadMessageCount = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const restrieveRes: { type: number; count: number }[] =
        await queryPromise(
          `SELECT type, COUNT(*) AS count FROM messages WHERE receiver_id = ? AND status = 0 GROUP BY type`,
          [req.state!.userInfo.user_id]
        );
      const result = {
        type_1: 0,
        type_2: 0,
        type_3: 0,
        total: 0,
      };
      restrieveRes.forEach((item) => {
        switch (item.type) {
          case 1: {
            result.type_1 = item.count;
            break;
          }
          case 2: {
            result.type_2 = item.count;
            break;
          }
          case 3: {
            result.type_3 = item.count;
            break;
          }
        }
      });
      result.total = result.type_1 + result.type_2 + result.type_3;
      unifiedResponseBody({
        res,
        result,
        result_msg: "获取所有类型的未读消息的数量成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "获取所有类型的未读消息的数量失败",
      });
    }
  };
}

export const otherData = new OtherData();
