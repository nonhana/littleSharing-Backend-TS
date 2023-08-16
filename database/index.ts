// 导入mysql模块
import mysql from 'mysql';

// 创建数据库连接对象
const db = mysql.createPool({
	// host: '127.0.0.1', // 本地数据库
	// database: 'littlesharing~', // 本地数据库
	// password: '20021209xiang', // 本地数据库
	host: '13.115.119.139', // AWS EC2 MySQL数据库
	database: 'littlesharing', // AWS EC2 MySQL数据库
	password: 'ec2demoserverdatabase', // AWS EC2 MySQL数据库
	user: 'root',
});

// 向外共享db数据库连接对象
export default db;
