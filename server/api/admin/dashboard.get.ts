import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'
import dayjs from 'dayjs'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { articles: articlesCol, categories: categoriesCol, tags: tagsCol } = getCollections(db)
    const notDeleted: any = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }
    // 1. 基础计数
    const [totalArticles, totalCategories, totalTags] = await Promise.all([
      articlesCol.countDocuments(notDeleted),
      categoriesCol.countDocuments({}),
      tagsCol.countDocuments({})
    ])

    // 2. 最近文章 (Top 5)
    const recentArticles = (await articlesCol
      .find(notDeleted, { projection: { _id: 0, id: 1, title: 1, createdAt: 1, categoryId: 1 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()).map((a: any) => ({
        id: a.id,
        title: a.title,
        created_at: a.createdAt,
        category_id: a.categoryId
      }))

    // 3. 分类统计 (Top 10)
    const categoryStats = (await categoriesCol
      .find({}, { projection: { _id: 0, name: 1, count: 1 } })
      .sort({ count: -1 })
      .limit(10)
      .toArray()).map((c: any) => ({ name: c.name, value: c.count }))

    // 4. 标签统计 (Top 10)
    const tagStats = (await tagsCol
      .find({}, { projection: { _id: 0, name: 1, count: 1 } })
      .sort({ count: -1, name: 1 })
      .limit(10)
      .toArray()).map((t: any) => ({ name: t.name, value: t.count }))

    // 5. 发布趋势 (最近 6 个月)
    const startDate = dayjs().subtract(6, 'month').toDate()
    const trendStats = await articlesCol
      .aggregate([
        { $match: { ...notDeleted, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: '+08:00' } },
            count: { $sum: 1 }
          }
        },
        { $project: { _id: 0, date: '$_id', count: 1 } },
        { $sort: { date: 1 } }
      ])
      .toArray()

    // 补全缺失的月份 (如果某个月没有文章，SQL 可能不返回)
    const months: string[] = []
    for (let i = 5; i >= 0; i--) {
      months.push(dayjs().subtract(i, 'month').format('YYYY-MM'))
    }
    
    const trendMap = new Map(trendStats.map((item: any) => [item.date, item.count]))
    const finalTrend = months.map(date => ({
      date,
      count: trendMap.get(date) || 0
    }))

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: 'success',
      data: {
        totalArticles: totalArticles || 0,
        totalCategories: totalCategories || 0,
        totalTags: totalTags || 0,
        recentArticles: recentArticles || [],
        categoryStats: categoryStats || [],
        tagStats: tagStats || [],
        publishTrend: finalTrend
      }
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
