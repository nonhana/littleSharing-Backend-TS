// controller/article/types/index.ts

/* ----------请求体---------- */
/**
 * 上传文章的请求体
 */
export interface PostArticleRequestBody {
  /**
   * 文章简介
   */
  article_introduce: string;
  /**
   * 文章标签列表
   */
  article_labels: string[];
  /**
   * 文章原文链接
   */
  article_link?: string;
  /**
   * 文章所属专业
   */
  article_major: string[];
  /**
   * 文章Markdown字符串
   */
  article_md: string;
  /**
   * 文章状态，0-原创文章，1-转载文章
   */
  article_status: 0 | 1;
  /**
   * 文章标题
   */
  article_title: string;
  /**
   * 文章作者id
   */
  author_id: number;
}

/**
 * 编辑文章的请求体
 */
export interface EditArticleRequestBody {
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 文章简介
   */
  article_introduce: string;
  /**
   * 文章标签列表
   */
  article_labels: string[];
  /**
   * 文章转载URL
   */
  article_link?: string;
  /**
   * 文章专业
   */
  article_major: string[];
  /**
   * 文章Markdown字符串
   */
  article_md: string;
  /**
   * 文章状态，0-原创文章，1-转载文章
   */
  article_status: 0 | 1;
  /**
   * 文章标题
   */
  article_title: string;
  /**
   * 文章更新日期
   */
  article_updatedate: string;
}

/**
 * 删除文章的请求体
 */
export interface DeleteArticleRequestBody {
  /**
   * 文章id
   */
  article_id: number;
}

/**
 * 新增文章标签的请求体
 */
export interface AddArticleLabelRequestBody {
  /**
   * 文章标签列表
   */
  label_list: string[];
}

/**
 * 新增文章书签的请求体
 */
export interface AddBookMarkRequestBody {
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 距离顶部的高度
   */
  topHeight: number;
}

/**
 * 删除文章书签的请求体
 */
export interface RemoveBookMarkRequestBody {
  /**
   * 文章id
   */
  article_id: number;
}

/**
 * 更新文章浏览趋势的请求体
 */
export interface PostArticleTrendRequestBody {
  /**
   * 该文章的标签列表
   */
  label_list: string[];
  /**
   * 当前日期
   */
  present_date: string;
}

/**
 * 增加文章浏览数的请求体
 */
export interface IncreaseArticleViewRequestBody {
  /**
   * 文章id
   */
  article_id: number;
}

/* ----------返回数据实体---------- */

/**
 * 文章信息（详细）
 */
export interface Article {
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 文章简介
   */
  article_introduce: string;
  /**
   * 文章标签列表
   */
  article_labels: string;
  /**
   * 文章原文链接
   */
  article_link?: string;
  /**
   * 文章所属专业
   */
  article_major: string;
  /**
   * 文章状态码，1-转载文章，2-原创文章
   */
  article_status: 1 | 2;
  /**
   * 文章标题
   */
  article_title: string;
  /**
   * 文章更新的日期
   */
  article_updatedate: string;
  /**
   * 文章发布的日期
   */
  article_uploaddate: string;
  /**
   * 文章md原文文档
   */
  artilce_md: string;
  /**
   * 文章作者id
   */
  author_id: string;
  /**
   * 文章被收藏数
   */
  collection_num: string;
  /**
   * 文章被评论数
   */
  comment_num: string;
  /**
   * 文章被点赞数
   */
  like_num: string;
  /**
   * 文章被分享数
   */
  share_num: string;
  /**
   * 文章被浏览数
   */
  view_num: string;
}

/**
 * 文章信息（简略）
 */
export interface ArticleSimple {
  /**
   * 文章id
   */
  article_id: number;
  /**
   * 文章标题
   */
  article_title: string;
  /**
   * 文章标签列表
   */
  article_labels: string;
  /**
   * 文章简介
   */
  article_introduce: string;
  /**
   * 文章发布日期
   */
  article_uploaddate: string;
  /**
   * 文章作者id
   */
  author_id: string;
  /**
   * 文章作者名称
   */
  author_name: string;
}

/**
 * 文章信息（数据库）
 */
export interface ArticleSrc {
  article_id: number;
  article_title: string;
  article_status: 1 | 2;
  article_major: string;
  article_labels: string;
  article_introduce: string;
  author_id: number;
  article_link?: string;
  like_num: number;
  collection_num: number;
  comment_num: number;
  share_num: number;
  view_num: number;
  article_uploaddate: string;
  article_updatedate: string;
  artilce_md: string;
}

/**
 * 文章标签信息
 */
export interface Label {
  /**
   * 标签id
   */
  label_id: number;
  /**
   * 标签名称
   */
  label_name: string;
}

/**
 * 文章书签信息
 */
export interface Bookmark {
  /**
   * 书签id
   */
  bookmark_id: number;
  /**
   * 书签所属文章id
   */
  article_id: number;
  /**
   * 距离顶部的高度
   */
  topHeight: number;
  /**
   * 书签所属用户id
   */
  user_id: number;
}

/**
 * 文章趋势信息
 */
export interface Trend {
  /**
   * 趋势id
   */
  id: number;
  /**
   * 趋势名称
   */
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

/**
 * 文章关键词信息
 */
export interface Keyword {
  /**
   * 用户id
   */
  user_id: number;
  /**
   * 关键词名称
   */
  keywords_name: string;
  /**
   * 关键词数量
   */
  keywords_count: number;
}
