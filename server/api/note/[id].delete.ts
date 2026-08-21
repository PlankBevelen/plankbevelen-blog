import { defineEventHandler, setResponseStatus } from 'h3'
import { getCollections, withTransaction } from '../../utils/mongo'
import { updateNoteCategoryCount } from '../../utils/note-helpers'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    await withTransaction(async (ctx) => {
      const { notes } = getCollections(ctx.db)
      const oldNote: any = await notes.findOne(
        { id, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (!oldNote) {
        const error: any = new Error('笔记不存在')
        error.statusCode = 404
        throw error
      }

      await notes.updateOne(
        { id },
        { $set: { deletedAt: new Date(), updatedAt: new Date() } },
        ctx.session ? { session: ctx.session } : undefined
      )

      await updateNoteCategoryCount(oldNote.categoryId, null, ctx)
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '删除成功', data: { id } }
  } catch (error: any) {
    if (Number(error?.statusCode) === 404) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '笔记不存在', data: null }
    }
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
