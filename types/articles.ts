/**
 * 文章基础信息
 */
export interface ArticleBasicInfo {
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 文章标题
   */
  article_title: string;
  /**
   * 文章详情内容(HTML)
   */
  article_details: string;
  /**
   * 文章状态("1":原创,"2":转载)
   */
  article_status: "1" | "2";
  /**
   * 文章专业
   */
  article_major: string | string[];
  /**
   * 文章标签
   */
  article_labels: string | string[];
  /**
   * 文章简介
   */
  article_introduce: string;
  /**
   * 文章作者id
   */
  author_id: number;
  /**
   * 原文链接
   */
  article_link: string;
  /**
   * 点赞数
   */
  like_num: number;
  /**
   * 收藏数
   */
  collect_num: number;
  /**
   * 评论数
   */
  comments_num: number;
  /**
   * 分享数
   */
  share_num: number;
  /**
   * 浏览数
   */
  view_num: number;
  /**
   * 文章第一次发布日期
   */
  article_uploaddate: string;
  /**
   * 文章最后一次更新日期
   */
  article_updatedate: string;
  /**
   * 文章内容(Markdown)
   */
  article_md: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  /**
   * 用户名称
   */
  name: string;
  /**
   * 用户专业
   */
  major: string;
  /**
   * 用户大学
   */
  university: string;
  /**
   * 用户头像
   */
  headphoto: string;
  /**
   * 用户签名
   */
  signature: string;
  /**
   * 用户发表过的文章数量
   */
  article_num: number;
}

/**
 * 文章列表item
 */
export interface ArticleListItem extends ArticleBasicInfo {
  /**
   * 文章封面
   */
  cover_image: string;
  /**
   * 作者名称
   */
  author_name: string;
  /**
   * 作者专业
   */
  author_major: string;
  /**
   * 作者大学
   */
  author_university: string;
  /**
   * 作者头像
   */
  author_headphoto: string;
  /**
   * 作者签名
   */
  author_signature: string;
  /**
   * 作者发布的文章数量
   */
  article_num: number;
}

/**
 * 用户关键字
 */
export interface UserKeyword {
  /**
   * 关键字名称
   */
  keywords_name: string;
  /**
   * 关键字数量
   */
  keywords_count: number;
  /**
   * 用户id
   */
  user_id: number;
}

/**
 * 书签信息
 */
export interface Bookmark {
  /**
   * 书签id
   */
  bookmark_id: number;
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 书签具体位置
   */
  topHeight: string;
  /**
   * 用户id
   */
  user_id: number;
}

/**
 * 趋势信息
 */
export interface Trend {
  id: number;
  trend_name: string;
  January: number;
  February: number;
  March: number;
  April: number;
  May: number;
  June: number;
  July: number;
  August: number;
  September: number;
  October: number;
  November: number;
  December: number;
}
