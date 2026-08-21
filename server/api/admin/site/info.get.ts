import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../../utils/mongo'

const SITE_URL = 'https://plankbevelen.cn'
const SITE_AUTHOR = 'plankbevelen'
const SITE_NAME = 'plankbevelen 的个人博客'
const SITE_DESCRIPTION =
  'plankbevelen 的个人博客，记录前端、创作和个人项目的持续实践。'
const SITE_LOCALE = 'zh'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { articles, categories, tags } = getCollections(db)
    const notDeleted: any = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }

    const [totalArticles, totalCategories, totalTags, latestArticle] = await Promise.all([
      articles.countDocuments(notDeleted),
      categories.countDocuments({}),
      tags.countDocuments({}),
      articles
        .find(notDeleted, { projection: { _id: 0, updatedAt: 1 } })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(1)
        .next()
    ])

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        siteName: SITE_NAME,
        siteUrl: SITE_URL,
        siteAuthor: SITE_AUTHOR,
        siteDescription: SITE_DESCRIPTION,
        defaultLocale: SITE_LOCALE,
        content: {
          totalArticles,
          totalCategories,
          totalTags,
          latestUpdatedAt: latestArticle?.updatedAt || null
        },
        seo: {
          sitemap: `${SITE_URL}/sitemap.xml`,
          robots: `${SITE_URL}/robots.txt`,
          canonicalEnabled: true,
          adminBlocked: true
        },
        stack: {
          framework: 'Nuxt 4',
          ui: 'Element Plus + Tailwind CSS',
          database: 'MongoDB',
          runtime: process.version,
          renderMode: 'SSR'
        }
      }
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: 'server error', data: null }
  }
})
