import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'
import { normalizeUploadsInContent } from '../../utils/content'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { articles } = getCollections(db)
    const article: any = await articles.findOne({
      id,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
    })
    if (!article) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '未找到文章', data: null }
    }

    // 获取上一条和下一条
    const [prevDoc, nextDoc] = await Promise.all([
      articles
        .find({
          id: { $lt: id },
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
        })
        .project({ _id: 0, id: 1, title: 1 })
        .sort({ id: -1 })
        .limit(1)
        .next(),
      articles
        .find({
          id: { $gt: id },
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
        })
        .project({ _id: 0, id: 1, title: 1 })
        .sort({ id: 1 })
        .limit(1)
        .next()
    ])
    const prev = prevDoc ? { id: String(prevDoc.id), title: prevDoc.title } : null
    const next = nextDoc ? { id: String(nextDoc.id), title: nextDoc.title } : null

    const content = normalizeUploadsInContent(String(article.content || ''))

    const data = {
      id: String(article.id),
      title: article.title,
      tags: Array.isArray(article.tags) ? article.tags : [],
      category: String(article.categoryId),
      content,
      createTime: article.createdAt,
      updateTime: article.updatedAt,
      prev,
      next
    }

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
