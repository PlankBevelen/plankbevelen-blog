import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'
import { normalizeUploadsInContent } from '../../utils/content'
import { findCategoryName } from '../../utils/article-helpers'
import { compileArticle, readingIsCurrent, type ArticleReading } from '../../modules/article/reading'
import { toArticleListItem, type ArticleDetail } from '../../modules/article/payload'
import { isAdminRequest } from '../../modules/article/session'

const notDeleted = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { articles } = getCollections(db)
    const article = await articles.findOne({ id, ...notDeleted })
    if (!article) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '未找到文章', data: null }
    }

    const content = normalizeUploadsInContent(String(article.content || ''))
    let reading: ArticleReading = {
      html: typeof article.html === 'string' ? article.html : '',
      previewHtml: typeof article.previewHtml === 'string' ? article.previewHtml : '',
      excerpt: String(article.excerpt || ''),
      cover: article.cover ? String(article.cover) : null,
      toc: Array.isArray(article.toc) ? article.toc : [],
      rendererVersion: Number(article.rendererVersion || 0),
    }
    if (!readingIsCurrent(article) || content !== String(article.content || '')) {
      reading = compileArticle(content)
      await articles.updateOne({ id }, { $set: { content, ...reading } })
    }

    const [prevDoc, nextDoc, category, admin] = await Promise.all([
      articles
        .find({ id: { $lt: id }, ...notDeleted })
        .project({ _id: 0, id: 1, title: 1 })
        .sort({ id: -1 })
        .limit(1)
        .next(),
      articles
        .find({ id: { $gt: id }, ...notDeleted })
        .project({ _id: 0, id: 1, title: 1 })
        .sort({ id: 1 })
        .limit(1)
        .next(),
      findCategoryName(Number(article.categoryId), { db }),
      isAdminRequest(event),
    ])

    const data: ArticleDetail = {
      ...toArticleListItem({
        id: article.id,
        title: article.title,
        tags: article.tags,
        category,
        excerpt: reading.excerpt,
        previewHtml: reading.previewHtml,
        cover: reading.cover,
        createTime: article.createdAt,
        updateTime: article.updatedAt,
        pinned: article.pinned === true,
      }),
      html: reading.html,
      toc: reading.toc,
      pinnedAt: article.pinnedAt ?? null,
      prev: prevDoc ? { id: String(prevDoc.id), title: String(prevDoc.title || '') } : null,
      next: nextDoc ? { id: String(nextDoc.id), title: String(nextDoc.title || '') } : null,
    }
    if (admin) {
      data.content = content
      data.categoryId = String(article.categoryId || '')
    }

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch (error) {
    console.error('查询文章详情失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
