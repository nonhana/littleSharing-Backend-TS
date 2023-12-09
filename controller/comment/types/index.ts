// controller/comment/types/index.ts
/* ----------请求体---------- */
/**
 * 评论相关操作请求体
 */
export interface CommentActionRequestBody {
  /**
   * 评论操作，0-发布评论，1-删除评论
   */
  action_type: 0 | 1;
  /**
   * 评论的对象id
   */
  article_id?: number;
  /**
   * 用户填写的评论内容（action_type =1）
   */
  comment_content?: string;
  /**
   * 发布该评论的日期
   */
  create_date?: string;
  /**
   * 要删除的评论id（action_type = 2）
   */
  delete_comment_id?: number;
  /**
   * 发布二级评论时被评论的comment_id
   */
  response_to_comment_id?: number;
  /**
   * 发布二级评论时被评论的用户id
   */
  response_to_user_id?: number;
  /**
   * 发布该评论的用户id
   */
  user_id?: number;
  /**
   * 评论级别，0-一级评论，1-二级评论
   */
  comment_level?: 0 | 1;
}

/**
 * 评论点赞相关操作请求体
 */
export interface CommentLikeActionRequestBody {
  /**
   * 评论id
   */
  comment_id: number;
  /**
   * 评论点赞操作，0-点赞，1-取消点赞
   */
  action_type: 0 | 1;
}

/* ----------返回数据实体---------- */
/**
 * 评论（数据库）
 */
export interface CommentSrc {
  /**
   * 评论id
   */
  comment_id: number;
  /**
   * 评论内容
   */
  comment_content: string;
  /**
   * 评论被点赞数
   */
  likes: number;
  /**
   * 评论者id
   */
  user_id: number;
  /**
   * 该评论所回复的评论id（二级评论）
   */
  response_to_comment_id: number;
  /**
   * 该评论所回复的用户id（二级评论）
   */
  response_to_user_id: number;
  /**
   * 评论级别，0-一级评论，1-二级评论
   */
  comment_level: 0 | 1;
  /**
   * 评论所属文章id
   */
  article_id: number;
  /**
   * 评论创建时间
   */
  create_date: string;
}

/**
 * 一级评论
 */
export interface Level0Comment {
  /**
   * 评论id
   */
  comment_id: number;
  /**
   * 评论内容
   */
  comment_content: string;
  /**
   * 评论创建时间
   */
  create_date: string;
  /**
   * 评论被点赞数
   */
  likes: number;
  /**
   * 评论者相关信息
   */
  commentator: {
    /**
     * 评论者id
     */
    user_id: number;
    /**
     * 评论者昵称
     */
    name: string;
    /**
     * 评论者头像
     */
    header_photo: string;
  };
  /**
   * 评论的回复列表
   */
  response: Level1Comment[];
}

/**
 * 二级评论
 */
export interface Level1Comment {
  /**
   * 该评论所回复的评论id
   */
  response_to_comment_id: number;
  /**
   * 评论id
   */
  comment_id: number;
  /**
   * 评论内容
   */
  comment_content: string;
  /**
   * 评论创建时间
   */
  response_date: string;
  /**
   * 评论被点赞数
   */
  likes: number;
  /**
   * 回复者相关信息
   */
  respondent: {
    /**
     * 回复者id
     */
    user_id: number;
    /**
     * 回复者昵称
     */
    name: string;
    /**
     * 回复者头像
     */
    header_photo: string;
  };
  /**
   * 被回复者相关信息
   */
  response_to: {
    /**
     * 被回复者id
     */
    user_id?: number;
    /**
     * 被回复者昵称
     */
    name?: string;
  };
}
