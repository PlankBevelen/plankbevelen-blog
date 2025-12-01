// server/utils/db.js
import mysql from 'mysql2/promise';
import type { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库配置（从环境变量读取）
const config = {
  host: process.env.NUXT_DB_HOST || 'localhost',
  port: Number(process.env.NUXT_DB_PORT) || 3306,
  user: process.env.NUXT_DB_USER || 'root',
  password: process.env.NUXT_DB_PASSWORD || '',
  database: process.env.NUXT_DB_NAME || '',
  connectionLimit: Number(process.env.NUXT_DB_CONNECTION_LIMIT) || 10,
  timezone: '+08:00',
  connectTimeout: 10000, // 10秒
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  typeCast: function (field: any, next: any) {
    if (field.type === 'JSON') {
      try {
        return JSON.parse(field.string())
      } catch {
        return field.string()
      }
    }
    return next()
  }
};

// 创建全局连接池（单例）
let pool: Pool | null = null
let keepAliveTimer: NodeJS.Timeout | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(config)
  }
  return pool
}

export async function closeDB() {
  if (pool) {
    stopKeepAlive()
    await pool.end()
    pool = null
  }
}

export async function initDB() {
  try {
    const poolInstance = getPool()
    
    // 测试连接
    await poolInstance.query('SELECT 1')
    console.log('✅ 数据库连接初始化成功')
    
    // 启动保活任务（每 5 分钟一次，更合理）
    startKeepAlive()
    
    // 监听连接池事件
    poolInstance.on('connection', () => {
      console.log('🔗 新建数据库连接')
    })
    
    poolInstance.on('release', () => {
      console.log('🔓 释放数据库连接')
    })
    
    return true
  } catch (error) {
    console.error('❌ 数据库连接初始化失败:', (error as Error).message)
    return false
  }
}

// 保活任务
function startKeepAlive() {
  // 清理旧的定时器
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer)
  }
  
  // 每 5 分钟执行一次保活查询
  keepAliveTimer = setInterval(async () => {
    try {
      await getPool().query('SELECT 1')
      console.log('✅ 数据库保活查询成功')
    } catch (error) {
      console.error('❌ 数据库保活查询失败:', (error as Error).message)
    }
  }, 5 * 60 * 1000) // 5 分钟
}

// 停止保活任务
export function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer)
    keepAliveTimer = null
    console.log('⏹️ 数据库保活任务已停止')
  }
}

export async function query<T extends RowDataPacket>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await getPool().query<T[]>(sql, params)
    return rows
  } catch (error) {
    console.error('❌ 数据库查询失败:', {
      sql,
      params,
      error: (error as Error).message
    })
    throw error
  }
}

export async function execute(
  sql: string,
  params?: any[]
): Promise<ResultSetHeader> {
  try {
    const [result] = await getPool().execute<ResultSetHeader>(sql, params)
    return result
  } catch (error) {
    console.error('❌ 数据库执行失败:', {
      sql,
      params,
      error: (error as Error).message
    })
    throw error
  }
}

