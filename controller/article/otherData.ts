import type { Request, Response } from "express";
import {
  queryPromise,
  unifiedResponseBody,
  errorHandler,
} from "../../utils/index";
import type { AuthenticatedRequest } from "../../middleware/user.middleware";

class OtherData {
  // 获取文章书签
  getBookMark = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const retrieveRes = await queryPromise(
        "select * from article_bookmarks where user_id = ?",
        req.state!.userInfo.user_id
      );
      unifiedResponseBody({
        res,
        result_msg: "获取书签成功",
        result: retrieveRes,
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "获取书签失败",
      });
    }
  };

  // 获取文章趋势
  getArticleTrend = async (_: Request, res: Response) => {
    try {
      const source = await queryPromise("select * from scan_trend");

      const updatedTrends = source.map((trend: any) => {
        const {
          January,
          February,
          March,
          April,
          May,
          June,
          July,
          August,
          September,
          October,
          November,
          December,
        } = trend;
        const total =
          January +
          February +
          March +
          April +
          May +
          June +
          July +
          August +
          September +
          October +
          November +
          December;
        return { ...trend, total };
      });
      updatedTrends.sort((a: any, b: any) => b.total - a.total);
      const topFiveTrends = updatedTrends.slice(0, 5).map((trend: any) => {
        const {
          id,
          trend_name,
          January,
          February,
          March,
          April,
          May,
          June,
          July,
          August,
          September,
          October,
          November,
          December,
        } = trend;
        const value_list = [
          January,
          February,
          March,
          April,
          May,
          June,
          July,
          August,
          September,
          October,
          November,
          December,
        ];
        return { id, trend_name, value_list };
      });
      unifiedResponseBody({
        res,
        result_msg: "获取文章趋势成功",
        result: topFiveTrends,
      });
    } catch (error) {
      errorHandler({
        res,
        error,
        result: { error },
        result_msg: "获取文章趋势失败",
      });
    }
  };
}

export const otherData = new OtherData();
