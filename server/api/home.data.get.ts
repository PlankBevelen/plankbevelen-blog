import { defineEventHandler, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../utils/mongo'
import { getSiteContent } from '../utils/site-content'

type HomeArticle = {
  id: string
  title: string
  tags: string[]
  category: string
  createTime: Date | string
  updateTime: Date | string
}

async function getLatestArticles(limit: number): Promise<HomeArticle[]> {
  const db = getDb()
  const { articles } = getCollections(db)

  const rows = await articles
    .aggregate([
      { $match: { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: 'id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { updatedAt: -1, createdAt: -1, id: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          tags: 1,
          category: { $ifNull: ['$category.name', ''] },
          createTime: '$createdAt',
          updateTime: '$updatedAt'
        }
      }
    ])
    .toArray()

  return (rows || []).map((item: any) => ({
    id: String(item.id),
    title: String(item.title || ''),
    tags: Array.isArray(item.tags) ? item.tags : [],
    category: String(item.category || ''),
    createTime: item.createTime,
    updateTime: item.updateTime
  }))
}

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { categories, tags, articles } = getCollections(db)

    const [latestArticles, categoryRows, tagRows, articleCount, siteContent] = await Promise.all([
      getLatestArticles(5),
      categories.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray(),
      tags.find({}, { projection: { _id: 0, name: 1, count: 1 } }).sort({ count: -1, name: 1 }).toArray(),
      articles.countDocuments({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }),
      getSiteContent(db)
    ])

    const featuredProjects = (siteContent.data?.projects || [])
      .slice()
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
      .slice(0, 4)

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        latestArticles,
        featuredProjects,
        categories: categoryRows || [],
        tags: tagRows || [],
        stats: {
          articles: Number(articleCount || 0),
          categories: (categoryRows || []).length,
          tags: (tagRows || []).length
        }
      }
    }
  } catch (error: any) {
    console.error('Home data error:', error)
    setResponseStatus(event, 500)
    return {
      status: 500,
      msg: 'server error',
      data: null
    }
  }
})
