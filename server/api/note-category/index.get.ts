import { defineEventHandler, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { noteCategories } = getCollections(db)
    const rows = await noteCategories
      .find({}, { projection: { _id: 0, id: 1, name: 1, count: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ id: 1 })
      .toArray()
    const data = (rows || []).map((item) => ({
      id: item.id,
      name: item.name,
      count: item.count || 0,
      createTime: item.createdAt,
      updateTime: item.updatedAt
    }))
    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
