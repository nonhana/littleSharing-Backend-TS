#!/usr/bin/env node
import app from "../app";
import debug from "debug";
import http from "http";

/**
 * 从环境变量中获取端口并存储在 Express 中。
 */
const port = normalizePort(process.env.PORT || "4000");
app.set("port", port);

/**
 * 创建 HTTP 服务器。
 */
const server = http.createServer(app);

/**
 * 监听指定端口，绑定在所有网络接口上。
 */
server.listen(port, () => {
  console.log(`服务器正在监听端口 ${port}`);
});
server.on("error", onError);
server.on("listening", onListening);

/**
 * 将端口规范化为数字、字符串或 false。
 */
function normalizePort(val: any) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // 命名管道
    return val;
  }

  if (port >= 0) {
    // 端口号
    return port;
  }

  return false;
}

/**
 * HTTP 服务器 "error" 事件的事件监听器。
 */
function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "管道 " + port : "端口 " + port;

  // 处理特定的监听错误，并提供友好的错误提示信息
  switch (error.code) {
    case "EACCES":
      console.error(bind + " 需要提升权限");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " 已经在使用中");
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * HTTP 服务器 "listening" 事件的事件监听器。
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "管道 " + addr : "端口 " + addr!.port;
  debug("正在监听 " + bind);
}
