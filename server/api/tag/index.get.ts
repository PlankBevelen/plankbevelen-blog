import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { tags } = getCollections(db)
    const rows: any = await tags
      .find({}, { projection: { _id: 0, name: 1, count: 1 } })
      .sort({ count: -1, name: 1 })
      .toArray()
    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data: rows || [] }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})

