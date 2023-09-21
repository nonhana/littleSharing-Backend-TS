import { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../utils/index";

class CommentController {
  // 获取评论列表
  getCommentList = async (req: Request, res: Response) => {
    const { article_id } = req.query;
    try {
      const commentSource = await queryPromise(
        "select * from comments where article_id = ?",
        article_id
      );

      let level0_comment_list: any[] = []; // 一级评论列表
      let level1_comment_list: any[] = []; // 二级评论列表

      for (const item of commentSource) {
        const user_id = item.user_id;

        const user_info = await queryPromise(
          "select * from users where id = ?",
          user_id
        );

        if (item.comment_level === 0) {
          const level0_comment_item = {
            comment_id: item.comment_id,
            content: item.content,
            create_date: item.create_date,
            likes: item.likes,
            commentator: {
              id: user_id,
              name: user_info[0].name,
              header_photo: user_info[0].headphoto,
            },
            response: [],
          };
          level0_comment_list.push(level0_comment_item);
        } else if (item.comment_level === 1) {
          let level1_comment_item = {
            response_to_comment_id: item.response_to_comment_id,
            comment_id: item.comment_id,
            content: item.content,
            response_date: item.create_date,
            likes: item.likes,
            respondent: {
              id: user_id,
              name: user_info[0].name,
              header_photo: user_info[0].headphoto,
            },
            response_to: {},
          };

          if (item.response_to_user_id) {
            const response_to_user_id = item.response_to_user_id;

            const response_to_user_info = await queryPromise(
              "select name from users where id = ?",
              response_to_user_id
            );

            level1_comment_item.response_to = {
              id: item.response_to_user_id,
              name: response_to_user_info[0].name,
            };
          }

          level1_comment_list.push(level1_comment_item);
        }
      }

      for (const item of level0_comment_list) {
        const comment_id = item.comment_id;
        item.response = level1_comment_list.filter(
          (item1) => item1.response_to_comment_id === comment_id
        );
      }

      unifiedResponseBody({
        result_msg: "获取评论列表成功",
        result: level0_comment_list,
        res,
      });
    } catch (error) {
      errorHandler({
        error,
        res,
        result: { error },
        result_msg: "获取评论列表失败",
      });
    }
  };

  // 评论相关操作
  commentAction = async (req: Request, res: Response) => {
    const { action_type, ...comment_info } = req.body;
    try {
      if (action_type === 0) {
        // 添加评论
        await queryPromise("insert into comments set ?", comment_info);
        unifiedResponseBody({
          result_msg: "评论成功",
          res,
        });
      } else if (action_type === 1) {
        // 删除评论
        await queryPromise(
          "delete from comments where comment_id=?",
          comment_info.comment_id
        );
        unifiedResponseBody({
          result_msg: "删除评论成功",
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
        result_msg: "评论失败",
      });
    }
  };

  // 评论点赞相关操作
  commentLikeAction = async (req: Request, res: Response) => {
    const { action_type, ...like_info } = req.body;
    try {
      if (action_type === 0) {
        // 添加评论点赞
        await queryPromise("insert into comment_like set ?", like_info);
        unifiedResponseBody({
          result_msg: "评论点赞成功",
          res,
        });
      } else if (action_type === 1) {
        // 删除评论点赞
        await queryPromise(
          "delete from comment_like where comment_id=? and user_id=?",
          [like_info.comment_id, like_info.user_id]
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

  // 获取用户的评论点赞列表
  getCommentLikeList = (req: Request, res: Response) => {
    const { user_id } = req.query;
    try {
      const retrieveRes = queryPromise(
        "select comment_id from comment_like where user_id=?",
        user_id
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

export const commentController = new CommentController();