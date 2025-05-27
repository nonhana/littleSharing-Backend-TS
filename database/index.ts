import mysql from 'mysql2'
import { dbConfig } from './db.config'

const db = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10,
})

// 判断数据库是否连接成功，并打印控制台信息
db.getConnection((err, _) => {
  if (err) {
    console.log(err)
    console.log('数据库连接失败')
  } else {
    console.log('数据库连接成功')
  }
})

export default db
