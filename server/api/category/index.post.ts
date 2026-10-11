import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { withTransaction, getCollections, getNextSequence } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ name: string }>(event)
    const name = body?.name?.trim()
    if (!name) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }
    const data = await withTransaction(async (ctx) => {
      const { categories } = getCollections(ctx.db)
      const id = await getNextSequence('categories', ctx)
      const now = new Date()
      const doc = { id, name, count: 0, createdAt: now, updatedAt: now }
      await categories.insertOne(doc, ctx.session ? { session: ctx.session } : undefined)
      return doc
    })
    setResponseStatus(event, 200)
    return { status: 200, msg: '新增成功', data: data }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
