import { setResponseStatus, defineEventHandler } from 'h3'
import { getDb, getCollections } from '../utils/mongo'

async function getLatestArticles(limit: number) {
  const db = getDb()
  const { articles } = getCollections(db)

  const rows: any = await articles
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
      { $sort: { createdAt: -1, id: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          category: { $ifNull: ['$category.name', ''] },
          createTime: '$createdAt'
        }
      }
    ])
    .toArray()

  return (rows || []).map((r: any) => ({
    title: r.title,
    category: r.category,
    createTime: r.createTime,
    id: String(r.id)
  }))
}

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { categories: categoriesCol, tags: tagsCol, articles: articlesCol } = getCollections(db)

    const [categories, tags, latestArticles, articleCountRes] = await Promise.all([
      categoriesCol.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray(),
      tagsCol.find({}, { projection: { _id: 0, name: 1, count: 1 } }).sort({ count: -1, name: 1 }).toArray(),
      getLatestArticles(5),
      articlesCol.countDocuments({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
    ])

    const articleCount = Number(articleCountRes || 0)

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: '查询成功',
      data: {
        categories: categories || [],
        tags: tags || [],
        latestArticles,
        stats: {
          articles: articleCount,
          categories: (categories || []).length,
          tags: (tags || []).length,
        }
      }
    }
  } catch (error: any) {
    console.error('Sidebar data error:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
