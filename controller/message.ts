import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../utils/index";
import type { MessageLike } from "../types/message";

class MessageController {
  // 查找某用户的点赞消息列表
  getMessageLikeList = async (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const sql_GetMessageLikeList =
        "SELECT ml.*, u.name AS user_name, u.headphoto, a.article_introduce, c.content AS comment_info " +
        "FROM message_like ml " +
        "LEFT JOIN users u ON ml.user_id = u.id " +
        "LEFT JOIN articles a ON ml.article_id = a.article_id " +
        "LEFT JOIN comments c ON ml.comment_id = c.comment_id " +
        "WHERE ml.receiver_id = ?";

      const source = await queryPromise(sql_GetMessageLikeList, user_id);

      const likeMessageList: MessageLike[] = source.map((message: any) => {
        const likeMessage: MessageLike = {
          message_id: message.message_id,
          user_id: message.user_id,
          user_name: message.user_name,
          user_img: message.headphoto,
          like_status: message.like_status,
          like_date: message.like_date,
        };

        if (likeMessage.like_status === 0) {
          likeMessage.article_id = message.article_id;
          likeMessage.article_info = message.article_introduce;
        } else {
          likeMessage.comment_id = message.comment_id;
          likeMessage.comment_info = message.comment_info;
        }

        return likeMessage;
      });

      unifiedResponseBody({
        result_msg: "获取点赞消息列表成功",
        result: likeMessageList,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "获取点赞消息列表失败",
        result: { error },
        res,
      });
    }
  };

  // 发送点赞消息
  sendMessageLike = async (req: Request, res: Response) => {
    const item = req.body;
    try {
      await queryPromise("insert into message_like set ?", item);

      unifiedResponseBody({
        result_msg: "发送点赞消息成功",
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        result_msg: "发送点赞消息失败",
        result: { error },
        res,
      });
    }
  };
}

export const messageController = new MessageController();
