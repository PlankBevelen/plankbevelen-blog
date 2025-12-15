import { defineEventHandler } from 'h3'
import { query } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    const articles: any = await query('SELECT id, updated_at FROM articles')
    
    return articles.map((article: any) => ({
      loc: `/article/detail?id=${article.id}`,
      lastmod: article.updated_at,
      changefreq: 'weekly',
      priority: 0.8
    }))
  } catch (error) {
    console.error('Sitemap fetch failed:', error)
    return []
  }
})
