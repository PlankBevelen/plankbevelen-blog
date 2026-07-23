import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { getCollections, withTransaction } from '../../utils/mongo'
import { allocateNoteCategoryId } from '../../utils/note-helpers'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ id?: string | number; name: string }>(event)
    const name = String(body?.name || '').trim()
    const requestedId = String(body?.id || '').trim()
    if (!name) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const data = await withTransaction(async (ctx) => {
      const { noteCategories } = getCollections(ctx.db)
      const opts = ctx.session ? { session: ctx.session } : undefined

      const existed = await noteCategories.findOne({ name }, opts)
      if (existed) {
        throw new Error('分类名称已存在')
      }

      let id = requestedId
      if (id) {
        const existedId = await noteCategories.findOne({ id }, opts)
        if (existedId) {
          throw new Error('分类 ID 已存在')
        }
      } else {
        id = await allocateNoteCategoryId(name, ctx)
      }

      const now = new Date()
      const doc = { id, name, count: 0, createdAt: now, updatedAt: now }
      await noteCategories.insertOne(doc, opts)
      return {
        id: doc.id,
        name: doc.name,
        count: doc.count || 0,
        createTime: doc.createdAt,
        updateTime: doc.updatedAt
      }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '新增成功', data }
  } catch (error: any) {
    const message = String(error?.message || '')
    if (message.includes('已存在')) {
      setResponseStatus(event, 400)
      return { status: 400, msg: message, data: null }
    }
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
