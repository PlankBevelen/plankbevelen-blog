import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../../utils/mongo'
import { buildVisitLogMatch, getVisitLogSummary } from '../../../utils/visit-log'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Math.max(1, Number(query.page || 1))
    const pageSize = Math.min(100, Math.max(10, Number(query.pageSize || 20)))
    const days = Math.min(90, Math.max(1, Number(query.days || 7)))
    const keyword = String(query.keyword || '').trim()
    const deviceType = String(query.deviceType || 'all')

    const db = getDb()
    const { visitLogs } = getCollections(db)
    const match = buildVisitLogMatch({ days, keyword, deviceType })

    const [total, list, summary] = await Promise.all([
      visitLogs.countDocuments(match),
      visitLogs
        .find(match, { projection: { _id: 0 } })
        .sort({ visitedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      getVisitLogSummary({ days, keyword, deviceType }, db)
    ])

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        summary,
        list,
        pagination: {
          page,
          pageSize,
          total,
          days
        }
      }
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: 'server error', data: null }
  }
})
