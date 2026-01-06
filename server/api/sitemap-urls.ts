import { defineEventHandler } from 'h3'
import { query } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    const articles: any = await query('SELECT id, title, updated_at, created_at FROM articles ORDER BY updated_at DESC')
    
    return articles.map((article: any, index: number) => ({
      loc: `/article/${article.id}`,
      lastmod: article.updated_at || article.created_at,
      changefreq: index < 10 ? 'daily' : 'weekly',
      priority: index < 5 ? 0.9 : (index < 20 ? 0.8 : 0.7)
    }))
  } catch (error) {
    console.error('Sitemap fetch failed:', error)
    return []
  }
})
