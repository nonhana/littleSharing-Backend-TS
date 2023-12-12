// controller/message/types/index.ts

/* ----------请求体---------- */

/**
 * 发送消息的请求体
 */
export interface PostMessageRequestBody {
  /**
   * 摘要内容。
   * 可以选择是否传递，如果要传递，直接就是超链接包裹的形式。
   */
  abstract?: string;
  /**
   * 消息内容。
   * 用span标签包裹，涉及到超链接的直接采用字符串拼接，把要链接的地址放到href中，并且采用target="_blank"的形式打开新窗口。
   */
  content: string;
  /**
   * 接收该消息的用户id
   */
  receiver_id: number;
  /**
   * 消息类型。
   * 1. 基本消息（点赞、收藏消息+评论消息+被其他用户关注消息）
   * 2. 关注的用户发布新文章消息
   * 3. 系统消息
   */
  type: 1 | 2 | 3;
}

/**
 * 删除消息的请求体
 */
export interface DeleteMessageRequestBody {
  /**
   * 消息id
   */
  message_id: number;
}

/**
 * 更改指定类型的所有未读消息为已读的请求体
 */
export interface ReadMessageRequestBody {
  /**
   * 消息类型。
   * 1. 基本消息（点赞、收藏消息+评论消息+被其他用户关注消息）
   * 2. 关注的用户发布新文章消息
   * 3. 系统消息
   */
  type: 1 | 2 | 3;
}

/* ----------返回数据实体---------- */
