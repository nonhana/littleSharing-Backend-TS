// controller/user/types/index.ts

/* ----------请求体---------- */

/**
 * 用户注册请求体
 */
export interface RegisterRequestBody {
  /**
   * 用户名称
   */
  name: string;
  /**
   * 用户账号
   */
  account: string;
  /**
   * 用户密码
   */
  password: string;
}

/**
 * 用户登录请求体
 */
export interface LoginRequestBody {
  /**
   * 用户账号
   */
  account: string;
  /**
   * 用户密码
   */
  password: string;
}

/**
 * 更改用户信息请求体
 */
export interface EditUserInfoRequestBody {
  /**
   * 用户背景图片URL
   */
  backgroundphoto: string;
  /**
   * 用户头像图片URL
   */
  headphoto: string;
  /**
   * 用户介绍
   */
  introduce: string;
  /**
   * 用户专业列表
   */
  major: string[];
  /**
   * 用户名称
   */
  name: string;
  /**
   * 用户签名
   */
  signature: string;
  /**
   * 用户大学
   */
  university: string;
  /**
   * 用户id
   */
  user_id: number;
  [property: string]: any;
}

/**
 * 用户关注请求体
 */
export interface FocusUserActionsRequestBody {
  /**
   * 关注操作类型，0：关注；1：取消关注
   */
  action_type: 0 | 1;
  /**
   * 自己的用户id
   */
  first_user_id: number;
  /**
   * 要关注的对方的用户id
   */
  second_user_id: number;
}

/**
 * 用户点赞请求体
 */
export interface AddLikeRequestBody {
  /**
   * 点赞操作类型，0：点赞；1：取消点赞
   */
  action_type: 0 | 1;
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 用户id
   */
  user_id: number;
  /**
   * 点赞时间，如果是取消点赞，则不需要传递该参数
   */
  update_date?: string;
}

/**
 * 用户收藏请求体
 */
export interface AddCollectRequestBody {
  /**
   * 收藏操作类型，0：收藏；1：取消收藏
   */
  action_type: 0 | 1;
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 用户id
   */
  user_id: number;
  /**
   * 收藏时间，如果是取消收藏，则不需要传递该参数
   */
  update_date?: string;
}

/* ----------返回数据实体----------- */

/**
 * 用户信息
 */
export interface User {
  /**
   * 用户账号
   */
  account: string;
  /**
   * 总共发布的文章数量
   */
  article_num: number;
  /**
   * 用户背景图片URL
   */
  backgroundphoto: string;
  /**
   * 文章被收藏次数
   */
  collect_num: number;
  /**
   * 文章被评论次数
   */
  comment_num: number;
  /**
   * 用户头像图片URL
   */
  headphoto: string;
  /**
   * 用户自我介绍
   */
  introduce: string;
  /**
   * 文章被喜欢次数
   */
  like_num: number;
  /**
   * 用户专业列表
   */
  major: string;
  /**
   * 用户名称
   */
  name: string;
  /**
   * 用户密码
   */
  password: string;
  /**
   * 用户签名
   */
  signature: string;
  /**
   * 用户大学
   */
  university: string;
  /**
   * 用户id
   */
  user_id: number;
}

/**
 * 关键词信息
 */
export interface Keyword {
  /**
   * 关键词id
   */
  keyword_id: number;
  /**
   * 关键词名称
   */
  keyword_name: string;
}

/**
 * 标签信息
 */
export interface Label {
  /**
   * 标签文本
   */
  label: string;
  /**
   * 标签值
   */
  value: string;
}

/**
 * 点赞信息
 */
export interface Like {
  /**
   * 用户id
   */
  user_id: number;
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 点赞时间
   */
  createdAt: string;
}

/**
 * 收藏信息
 */
export interface Collect {
  /**
   * 用户id
   */
  user_id: number;
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 收藏时间
   */
  createdAt: string;
}
