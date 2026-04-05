import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { withTransaction, getCollections } from '../../utils/mongo'
import { updateTagsCount, updateCategoryCount } from '../../utils/article-helpers'
import { normalizeUploadsInContent } from '../../utils/content'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    const body = await readBody<{ title: string; category: string; tags: string[]; content: string }>(event)
    const title = body?.title || ''
    const category = body?.category || ''
    let content = body?.content || ''
    const tagsArr = Array.isArray(body?.tags) ? body!.tags : []

    if (!id || !title || !category || !content) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const categoryId = Number(category)
    if (!categoryId) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const data = await withTransaction(async (ctx) => {
      const { articles } = getCollections(ctx.db)
      const oldArticle: any = await articles.findOne(
        { id },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (!oldArticle) throw new Error('Article not found')

      content = normalizeUploadsInContent(content)
      const nextTags = tagsArr.map(t => String(t).trim()).filter(Boolean)
      const now = new Date()

      await articles.updateOne(
        { id },
        {
          $set: {
            title,
            tags: nextTags,
            categoryId,
            content,
            updatedAt: now
          }
        },
        ctx.session ? { session: ctx.session } : undefined
      )

      await updateTagsCount(oldArticle.tags, nextTags, ctx)
      await updateCategoryCount(oldArticle.categoryId, categoryId, ctx)

      return {
        id: String(id),
        title,
        tags: nextTags,
        category: String(categoryId),
        content,
        createTime: oldArticle.createdAt,
        updateTime: now
      }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '更新成功', data }
  } catch (error: any) {
    console.error('更新文章失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
