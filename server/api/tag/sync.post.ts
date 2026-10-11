import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { withTransaction, getCollections } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ add?: string[]; remove?: string[] }>(event)
    const add = Array.isArray(body?.add) ? body!.add : []
    const remove = Array.isArray(body?.remove) ? body!.remove : []

    const normalize = (arr: string[]) => Array.from(new Set(arr.map((t) => String(t).replace(/，/g, ',').trim()).filter(Boolean)))
    const addTags = normalize(add)
    const removeTags = normalize(remove)

    await withTransaction(async (ctx) => {
      const { tags } = getCollections(ctx.db)
      const now = new Date()
      const opts = ctx.session ? { session: ctx.session } : undefined

      await Promise.all([
        ...addTags.map(name =>
          tags.updateOne(
            { name },
            { $setOnInsert: { createdAt: now, count: 0 }, $set: { updatedAt: now } },
            { ...opts, upsert: true }
          )
        ),
        ...removeTags.map(name => tags.deleteOne({ name, count: { $lte: 0 } }, opts))
      ])
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '同步成功', data: { add: addTags.length, remove: removeTags.length } }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})

