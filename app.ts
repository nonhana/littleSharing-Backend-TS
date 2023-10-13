import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
// 引入路由模块
import userRouter from "./routes/user";
import articleRouter from "./routes/article";
import commentRouter from "./routes/comment";
import messageRouter from "./routes/message";

const app = express();

// 视图引擎设置
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 配置中间件
app.use(logger("dev"));
// 设置请求体大小限制
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors());
// 配置静态资源路径
app.use(express.static("public"));

// 注册路由模块
app.use("/user", userRouter);
app.use("/article", articleRouter);
app.use("/message", messageRouter);
app.use("/comment", commentRouter);

// 捕捉404并转发到错误处理器
app.use(function (_, __, next) {
  next(createError(404));
});

// 错误处理器
app.use(function (err, req, res, _) {
  // 设置本地变量，仅在开发环境提供错误信息
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // 渲染错误页面
  res.status(err.status || 500);
  res.render("error");
} as express.ErrorRequestHandler);

// 导出 app 模块
export default app;
