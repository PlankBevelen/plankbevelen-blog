import { defineEventHandler } from 'h3'
import { getDb, getCollections } from '../utils/mongo'
import { pinnedRankStage, sortPinnedFirst } from '../utils/article-pin'

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
      .aggregate([
        { $match: notDeleted },
        pinnedRankStage,
        { $sort: sortPinnedFirst({ updatedAt: -1, id: -1 }) },
        { $project: { _id: 0, id: 1, updatedAt: 1, createdAt: 1, pinned: 1 } }
      ])
      .toArray()

    let unpinnedIndex = 0
    const articleUrls = articles.flatMap((article: any) => {
      const lastmod = article.updatedAt || article.createdAt || now
      const pinned = article.pinned === true
      const changefreq = pinned || unpinnedIndex < 10 ? 'daily' : 'weekly'
      const priority = pinned ? 0.9 : (unpinnedIndex < 20 ? 0.8 : 0.7)
      if (!pinned) unpinnedIndex += 1
      const loc = `/article/${article.id}`
      return withLocale(loc).map((x) => ({ loc: x, lastmod, changefreq, priority }))
    })

    return [...staticUrls, ...articleUrls]
  } catch (error) {
    console.error('Sitemap fetch failed:', error)
    return staticUrls
  }
})
