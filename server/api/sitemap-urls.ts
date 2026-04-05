import { defineEventHandler } from 'h3'
import { getDb, getCollections } from '../utils/mongo'

export default defineEventHandler(async () => {
  try {
    const db = getDb()
    const { articles: articlesCol } = getCollections(db)
    const articles: any = await articlesCol
      .find(
        { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        { projection: { _id: 0, id: 1, title: 1, updatedAt: 1, createdAt: 1 } }
      )
      .sort({ updatedAt: -1 })
      .toArray()
    
    return articles.map((article: any, index: number) => ({
      loc: `/article/${article.id}`,
      lastmod: article.updatedAt || article.createdAt,
      changefreq: index < 10 ? 'daily' : 'weekly',
      priority: index < 5 ? 0.9 : (index < 20 ? 0.8 : 0.7)
    }))
  } catch (error) {
    console.error('Sitemap fetch failed:', error)
    return []
  }
})
