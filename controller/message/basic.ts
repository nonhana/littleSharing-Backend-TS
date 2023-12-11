import type { Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";
import type {
  PostMessageRequestBody,
  DeleteMessageRequestBody,
} from "./types/index";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";

class Basic {
  // 发送消息的处理函数
  postMessage = async (req: AuthenticatedRequest, res: Response) => {
    const messageInfo = req.body as PostMessageRequestBody;
    try {
      switch (messageInfo.type) {
        case 1: {
          await queryPromise(`INSERT INTO messages SET ?`, {
            ...messageInfo,
            user_id: req.state!.userInfo.user_id,
          });
          break;
        }
        case 2: {
          await queryPromise(`INSERT INTO messages SET ?`, {
            ...messageInfo,
            user_id: req.state!.userInfo.user_id,
          });
          break;
        }
        case 3: {
          await queryPromise(`INSERT INTO messages SET ?`, messageInfo);
          break;
        }
        default: {
          unifiedResponseBody({
            res,
            result_code: 1,
            result_msg: "消息类型错误",
          });
          return;
        }
      }
      unifiedResponseBody({
        res,
        result_msg: "发送消息成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "发送消息失败",
      });
    }
  };

  // 获取消息的处理函数
  getMessage = async (req: AuthenticatedRequest, res: Response) => {
    const { type } = req.query;
    try {
      const messages = await queryPromise(
        `SELECT * FROM messages WHERE receiver_id = ? AND type = ?`,
        [req.state!.userInfo.user_id, type]
      );
      // 把message的item中值为null的属性剔除掉
      const result = await Promise.all(
        messages.map(async (item: any) => {
          const obj: any = {};
          if (item.user_id) {
            const userInfo = await queryPromise(
              "SELECT name, headphoto FROM users WHERE user_id = ?",
              item.user_id
            );
            obj.user_info = {
              user_id: item.user_id,
              user_name: userInfo[0].name,
              user_headphoto: userInfo[0].headphoto,
            };
          }
          for (const key in item) {
            if (item[key] !== null && key !== "receiver_id") {
              obj[key] = item[key];
            }
          }
          return obj;
        })
      );
      unifiedResponseBody({
        res,
        result,
        result_msg: "获取消息成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "获取消息失败",
      });
    }
  };

  // 删除消息的处理函数
  deleteMessage = async (req: AuthenticatedRequest, res: Response) => {
    const { message_id } = req.body as DeleteMessageRequestBody;
    try {
      await queryPromise(`DELETE FROM messages WHERE message_id = ?`, [
        message_id,
      ]);
      unifiedResponseBody({
        res,
        result_msg: "删除消息成功",
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "删除消息失败",
      });
    }
  };
}

export const basic = new Basic();
