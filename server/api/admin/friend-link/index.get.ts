import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event) as any
    const page = Math.max(1, Number(q.page || 1))
    const limit = Math.min(50, Math.max(1, Number(q.limit || 10) || 10))
    const status = String(q.status || '').trim()
    const offset = (page - 1) * limit

    const db = getDb()
    const { friendLinks } = getCollections(db)

    const match: any = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }
    if (['pending', 'approved', 'rejected'].includes(status)) match.status = status

    const total = await friendLinks.countDocuments(match)
    const rows = await friendLinks.find(match).sort({ id: -1 }).skip(offset).limit(limit).toArray()

    const data = (rows || []).map((r) => ({
      id: String(r.id),
      name: r.name,
      url: r.url,
      description: r.description,
      avatar: r.avatar,
      status: r.status,
      submitterIp: r.submitterIp || '',
      createTime: r.createdAt,
      updateTime: r.updatedAt
    }))

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data, total, page, limit }
  } catch (error) {
    console.error('查询友链失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
