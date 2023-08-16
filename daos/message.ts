/**
 * 从数据库里面查出来的点赞消息
 */
export interface MessageLikeSource {
  message_id: number;
  user_id: number;
  like_status: number;
  like_date: string;
  article_id: number | null;
  article_introduce: string | null;
  comment_id: number | null;
  content: string | null;
  user_name: string;
  headphoto: string;
}
/**
 * 点赞消息详细信息
 */
export interface MessageLike {
  /**
   * 文章id
   */
  article_id?: number;
  /**
   * 文章内容
   */
  article_info?: string;
  /**
   * 评论id
   */
  comment_id?: number;
  /**
   * 评论内容
   */
  comment_info?: string;
  /**
   * 点赞日期
   */
  like_date: string;
  /**
   * 点赞的类型，0-点赞文章；1-点赞评论
   */
  like_status: number;
  /**
   * 消息id
   */
  message_id: number;
  /**
   * 发给你消息的用户id
   */
  user_id: number;
  /**
   * 发给你消息的用户的头像
   */
  user_img: string;
  /**
   * 发给你消息的用户的用户名
   */
  user_name: string;
}
