import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { getCollections, withTransaction } from '../../utils/mongo'
import { normalizeUploadsInContent } from '../../utils/content'
import { updateNoteCategoryCount } from '../../utils/note-helpers'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    const body = await readBody<{
      title: string
      category: string
      chapter: string
      chapterOrder?: number | string
      noteOrder?: number | string
      content: string
    }>(event)
    const title = String(body?.title || '').trim()
    const category = String(body?.category || '').trim()
    const chapter = String(body?.chapter || '').trim()
    const chapterOrder = chapter ? Number(body?.chapterOrder ?? 0) : 0
    const noteOrder = Number(body?.noteOrder ?? 0)
    const content = String(body?.content || '')

    if (
      !id ||
      !title ||
      !category ||
      !content ||
      Number.isNaN(chapterOrder) ||
      Number.isNaN(noteOrder)
    ) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const data = await withTransaction(async (ctx) => {
      const { notes, noteCategories } = getCollections(ctx.db)
      const oldNote: any = await notes.findOne(
        { id, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (!oldNote) {
        const error: any = new Error('笔记不存在')
        error.statusCode = 404
        throw error
      }

      const categoryDoc = await noteCategories.findOne(
        { id: category },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (!categoryDoc) {
        const error: any = new Error('分类不存在')
        error.statusCode = 404
        throw error
      }

      const now = new Date()
      const nextContent = normalizeUploadsInContent(content)

      await notes.updateOne(
        { id },
        {
          $set: {
            title,
            categoryId: category,
            chapter,
            chapterOrder,
            noteOrder,
            content: nextContent,
            updatedAt: now
          }
        },
        ctx.session ? { session: ctx.session } : undefined
      )

      await updateNoteCategoryCount(oldNote.categoryId, category, ctx)

      return {
        id: String(id),
        title,
        category,
        chapter,
        chapterOrder,
        noteOrder,
        content: nextContent,
        createTime: oldNote.createdAt,
        updateTime: now
      }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '更新成功', data }
  } catch (error: any) {
    if (Number(error?.statusCode) === 404) {
      setResponseStatus(event, 404)
      return { status: 404, msg: error.message || '笔记不存在', data: null }
    }
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
