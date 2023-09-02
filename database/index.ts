// 导入mysql模块
import mysql from "mysql";
import { DATABASE_BASE_CONFIG, DATABASE_SERVER_CONFIG } from "../constance";

// 创建数据库连接对象
const db = mysql.createPool({
  // ...DATABASE_BASE_CONFIG
  ...DATABASE_SERVER_CONFIG,
  user: "root",
});

// 向外共享db数据库连接对象
export default db;
