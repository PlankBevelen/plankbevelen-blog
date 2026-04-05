import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    const body = await readBody<{ name: string }>(event)
    const name = body?.name?.trim()
    if (!id || !name) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }
    const db = getDb()
    const { categories } = getCollections(db)
    await categories.updateOne({ id }, { $set: { name, updatedAt: new Date() } })
    const doc: any = await categories.findOne({ id }, { projection: { _id: 0 } })
    setResponseStatus(event, 200)
    return { status: 200, msg: '更新成功', data: doc || { id, name } }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
