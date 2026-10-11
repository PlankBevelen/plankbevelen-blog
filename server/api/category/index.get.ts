import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
      const db = getDb()
      const { categories } = getCollections(db)
      const data = await categories.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray()
      setResponseStatus(event, 200)
      return {
        status: 200,
        msg: '查询成功',
        data
      }
  } catch (error) {
    setResponseStatus(event, 400)
    return {
      status: 400,
      msg: '服务器错误',
      data: null
    }
  }
})
