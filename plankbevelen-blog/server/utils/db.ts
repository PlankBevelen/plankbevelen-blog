// server/utils/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库配置（从环境变量读取）
const config = {
  host: process.env.NUXT_DB_HOST ,
  port: Number(process.env.NUXT_DB_PORT),
  user: process.env.NUXT_DB_USER || 'root',
  password: process.env.NUXT_DB_PASSWORD,
  database: process.env.NUXT_DB_NAME,
  connectionLimit: Number(process.env.NUXT_DB_CONNECTION_LIMIT),
  timezone: '+08:00',
  typeCast: function (field: any, next: any) {
    if (field.type === 'JSON') {
      return JSON.parse(field.string());
    }
    return next();
  }
};

// 创建全局连接池（单例）
export const pool = mysql.createPool(config);

// 测试/初始化连接
export async function initDB() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ 数据库连接初始化成功');
    // 定时保活（每分钟检测一次）
    setInterval(async () => {
      await pool.query('SELECT 1');
      console.log('✅ 数据库保活查询成功');
    }, 60000);
  } catch (error) {
    console.error('❌ 数据库连接初始化失败:', (error as Error).message);
    // 可选：连接失败时退出进程（生产环境建议保留，避免服务假活）
    // process.exit(1);
  }
}

export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function execute(sql: string, params?: any[]) {
  const [result] = await pool.execute(sql, params);
  return result;
}
