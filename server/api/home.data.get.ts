import { setResponseStatus, defineEventHandler } from 'h3'
import { getDb, getCollections } from '../utils/mongo'

async function getArticles(limit: number, sort: 'created' | 'updated' = 'updated') {
  const db = getDb()
  const { articles } = getCollections(db)

  const sortStage =
    sort === 'created'
      ? { createdAt: -1, id: -1 }
      : { updatedAt: -1, createdAt: -1, id: -1 }

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
      { $sort: sortStage },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: 1,
          title: 1,
          tags: 1,
          category: { $ifNull: ['$category.name', ''] },
          content: 1,
          createTime: '$createdAt',
          updateTime: '$updatedAt'
        }
      }
    ])
    .toArray()

  return (rows || []).map((r: any) => ({
    ...r,
    id: String(r.id),
    tags: Array.isArray(r.tags) ? r.tags : []
  }))
}

export default defineEventHandler(async (event) => {  
  try {
    const db = getDb()
    const { categories: categoriesCol, tags: tagsCol, articles: articlesCol } = getCollections(db)
    // Parallel execution for better performance and reliability (no loopback http calls)
    const [articles, categories, tags, latestArticlesRaw, articleCountRes] = await Promise.all([
      getArticles(10, 'updated'),
      categoriesCol.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray(),
      tagsCol.find({}, { projection: { _id: 0, name: 1, count: 1 } }).sort({ count: -1, name: 1 }).toArray(),
      getArticles(5, 'created'),
      articlesCol.countDocuments({ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] })
    ])

    const articleCount = Number(articleCountRes || 0)
    
    const latestArticles = latestArticlesRaw.map((r: any) => ({
      title: r.title,
      category: r.category,
      createTime: r.createTime,
      id: r.id
    }))

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: '查询成功',
      data: {
        articles,
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
    console.error('Home data error:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误: ' + (error?.message || '未知错误'), data: null }
  }
})
