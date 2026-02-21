import mysql from 'mysql2/promise';
import type { Pool, PoolOptions, RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise'
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库配置
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
    await poolInstance.query('SELECT 1')
    startKeepAlive()
    return true
  } catch (error) {
    console.error('❌ 数据库连接初始化失败:', (error as Error).message)
    return false
  }
}

// 保活任务
function startKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer)
  }
  
  keepAliveTimer = setInterval(async () => {
    try {
      await getPool().query('SELECT 1')
    } catch (error) {
      console.error((error as Error).message)
    }
  }, 5 * 60 * 1000) // 5 分钟
}

export function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer)
    keepAliveTimer = null
  }
}

export async function query<T extends RowDataPacket>(
  sql: string,
  params?: any[],
  connection?: PoolConnection
): Promise<T[]> {
  try {
    const executor = connection || getPool()
    const [rows] = await executor.query<T[]>(sql, params)
    return rows
  } catch (error) {
    console.error('sql error:', {
      sql,
      params,
      error: (error as Error).message
    })
    throw error
  }
}

export async function execute(
  sql: string,
  params?: any[],
  connection?: PoolConnection
): Promise<ResultSetHeader> {
  try {
    const executor = connection || getPool()
    const [result] = await executor.execute<ResultSetHeader>(sql, params)
    return result
  } catch (error) {
    console.error('sql error:', {
      sql,
      params,
      error: (error as Error).message
    })
    throw error
  }
}

/**
 * 事务包裹函数
 * @param callback 事务执行的回调函数，接收一个 connection 参数
 */
export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
