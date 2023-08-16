import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { expressjwt } from "express-jwt";
import bodyParser from "body-parser";
// 秘钥配置
import config from "./config";
// 引入路由模块
import userRouter from "./routes/user";
import articleRouter from "./routes/article";
import otherRouter from "./routes/other";
import messageRouter from "./routes/message";

const app = express();

// 视图引擎设置
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 配置中间件
app.use(cors());
app.use(
  bodyParser.json({
    limit: "10mb",
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "10000kb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(
  expressjwt({ secret: config.secretKey, algorithms: ["HS256"] }).unless({
    path: [/^\/user\//, /^\/api\//, /^\/images\//],
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 配置静态资源路径
app.use("/images", express.static(path.join(__dirname, "./public/images")));

// 注册路由模块
app.use("/user", userRouter);
app.use("/article", articleRouter);
app.use(otherRouter);
app.use("/message", messageRouter);

// 捕捉404并转发到错误处理器
app.use(function (req, res, next) {
  next(createError(404));
});

// 错误处理器
app.use(function (err, req, res, next) {
  // 设置本地变量，仅在开发环境提供错误信息
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // 渲染错误页面
  res.status(err.status || 500);
  res.render("error");
} as express.ErrorRequestHandler);

// 导出 app 模块
export default app;
