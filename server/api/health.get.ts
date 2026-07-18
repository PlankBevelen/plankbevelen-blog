import { defineEventHandler, setResponseStatus } from 'h3'
import { getPool } from '../utils/db'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()

  try {
    await getPool().query('SELECT 1 AS ok')

    return {
      status: 200,
      msg: 'ok',
      data: {
        uptime: process.uptime(),
        database: 'ok',
        env: process.env.NODE_ENV || 'unknown',
        elapsedMs: Date.now() - startedAt
      }
    }
  } catch (error: any) {
    setResponseStatus(event, 503)

    return {
      status: 503,
      msg: 'unhealthy',
      data: {
        uptime: process.uptime(),
        database: 'error',
        env: process.env.NODE_ENV || 'unknown',
        elapsedMs: Date.now() - startedAt,
        reason: error?.message || 'Database ping failed'
      }
    }
  }
})
