import { defineEventHandler } from 'h3'
import { getDb, getCollections } from '../utils/mongo'

export default defineEventHandler(async () => {
  const now = new Date().toISOString()
  const baseRoutes = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/article', changefreq: 'daily', priority: 0.9 },
    { loc: '/about', changefreq: 'monthly', priority: 0.6 },
    { loc: '/project', changefreq: 'monthly', priority: 0.5 },
    { loc: '/timeline', changefreq: 'monthly', priority: 0.5 },
  ]

  const withLocale = (loc: string) => {
    if (loc === '/') return ['/', '/en']
    return [loc, `/en${loc}`]
  }

  const staticUrls = baseRoutes
    .flatMap((r) => withLocale(r.loc).map((loc) => ({ ...r, loc })))
    .map((r) => ({ ...r, lastmod: now }))

  try {
    const db = getDb()
    const { articles: articlesCol } = getCollections(db)
    const notDeleted = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }

    const articles: any = await articlesCol
      .find(notDeleted, { projection: { _id: 0, id: 1, updatedAt: 1, createdAt: 1 } })
      .sort({ updatedAt: -1 })
      .toArray()

    const articleUrls = articles.flatMap((article: any, index: number) => {
      const lastmod = article.updatedAt || article.createdAt || now
      const changefreq = index < 10 ? 'daily' : 'weekly'
      const priority = index < 5 ? 0.9 : (index < 20 ? 0.8 : 0.7)
      const loc = `/article/${article.id}`
      return withLocale(loc).map((x) => ({ loc: x, lastmod, changefreq, priority }))
    })

    return [...staticUrls, ...articleUrls]
  } catch (error) {
    console.error('Sitemap fetch failed:', error)
    return staticUrls
  }
})
