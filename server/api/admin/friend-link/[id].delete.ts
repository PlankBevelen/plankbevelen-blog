import { defineEventHandler, setResponseStatus } from 'h3'
import { withTransaction, getCollections } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    await withTransaction(async (ctx) => {
      const { friendLinks } = getCollections(ctx.db)
      await friendLinks.updateOne(
        { id, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        { $set: { deletedAt: new Date(), updatedAt: new Date() } },
        ctx.session ? { session: ctx.session } : undefined
      )
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '删除成功', data: { id } }
  } catch (error) {
    console.error('删除友链失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
