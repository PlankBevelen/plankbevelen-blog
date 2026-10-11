import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { friendLinks } = getCollections(db)

    const rows = await friendLinks
      .find({
        status: 'approved',
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
      })
      .sort({ id: 1 })
      .toArray()

    const data = (rows || []).map((r) => ({
      id: String(r.id),
      name: r.name,
      url: r.url,
      description: r.description,
      avatar: r.avatar
    }))

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch (error) {
    console.error('查询友链失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
