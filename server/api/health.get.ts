import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb } from '../utils/mongo'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()

  try {
    await getDb().command({ ping: 1 })

    return {
      status: 200,
      msg: 'ok',
      data: {
        uptime: process.uptime(),
        mongo: 'ok',
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
        mongo: 'error',
        env: process.env.NODE_ENV || 'unknown',
        elapsedMs: Date.now() - startedAt,
        reason: 'MongoDB ping failed'
      }
    }
  }
})
