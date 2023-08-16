import db from "../database/index";
import type { Request, Response } from "express";
import type { MessageLike } from "../daos/message";

const messageController: {
  [key in string]: (req: Request, res: Response) => void;
} = {};

// 辅助函数：执行数据库查询并返回Promise，保证查询完成后再执行后续操作
function query(sql: string, ...params: unknown[]) {
  return new Promise((resolve, reject) => {
    db.query(sql, params[0], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// 查找某用户的点赞消息列表
messageController.getMessageLikeList = async (req, res) => {
  try {
    const user_id: number = req.query.user_id as unknown as number;

    const sql_GetMessageLikeList =
      "SELECT ml.*, u.name AS user_name, u.headphoto, a.article_introduce, c.content AS comment_info " +
      "FROM message_like ml " +
      "LEFT JOIN users u ON ml.user_id = u.id " +
      "LEFT JOIN articles a ON ml.article_id = a.article_id " +
      "LEFT JOIN comments c ON ml.comment_id = c.comment_id " +
      "WHERE ml.receiver_id = ?";

    const source = (await query(sql_GetMessageLikeList, user_id)) as any[];

    const likeMessageList: MessageLike[] = source.map((message) => {
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

    res.json({
      result_code: 0,
      result_msg: "获取点赞消息列表成功",
      message_list: likeMessageList,
    });
  } catch (err) {
    res.json({
      result_code: 1,
      result_msg: "获取点赞消息列表失败：" + err,
    });
  }
};

// 发送点赞消息
messageController.sendMessageLike = async (req, res) => {
  try {
    const { ...item } = req.body;

    const sql_SendMessageLike = "insert into message_like set ?";

    await query(sql_SendMessageLike, item);

    res.json({
      result_code: 0,
      result_msg: "发送点赞消息成功",
    });
  } catch (err) {
    res.json({
      result_code: 1,
      result_msg: "发送点赞消息失败：" + err,
    });
  }
};

export default messageController;
