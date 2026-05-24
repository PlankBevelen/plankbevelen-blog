import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    const body = await readBody<{ name: string }>(event)
    const name = String(body?.name || '').trim()
    if (!id || !name) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { noteCategories } = getCollections(db)
    const duplicated = await noteCategories.findOne({ name, id: { $ne: id } })
    if (duplicated) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '分类名称已存在', data: null }
    }

    const now = new Date()
    const updateResult = await noteCategories.updateOne({ id }, { $set: { name, updatedAt: now } })
    if (!updateResult.matchedCount) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '分类不存在', data: null }
    }

    const doc = await noteCategories.findOne(
      { id },
      { projection: { _id: 0, id: 1, name: 1, count: 1, createdAt: 1, updatedAt: 1 } }
    )
    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: '更新成功',
      data: doc
        ? {
            id: doc.id,
            name: doc.name,
            count: doc.count || 0,
            createTime: doc.createdAt,
            updateTime: doc.updatedAt
          }
        : null
    }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
