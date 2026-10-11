import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'
import { getVisitLogSummary } from '../../utils/visit-log'
import dayjs from 'dayjs'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { articles: articlesCol, categories: categoriesCol, tags: tagsCol } = getCollections(db)
    const notDeleted: any = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }

    const [totalArticles, totalCategories, totalTags, visitSummary] = await Promise.all([
      articlesCol.countDocuments(notDeleted),
      categoriesCol.countDocuments({}),
      tagsCol.countDocuments({}),
      getVisitLogSummary({ days: 30 }, db)
    ])

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

    const categoryStats = (await categoriesCol
      .find({}, { projection: { _id: 0, name: 1, count: 1 } })
      .sort({ count: -1 })
      .limit(10)
      .toArray()).map((c: any) => ({ name: c.name, value: c.count }))

    const tagStats = (await tagsCol
      .find({}, { projection: { _id: 0, name: 1, count: 1 } })
      .sort({ count: -1, name: 1 })
      .limit(10)
      .toArray()).map((t: any) => ({ name: t.name, value: t.count }))

    const monthStart = dayjs().subtract(6, 'month').toDate()
    const monthTrendStats = await articlesCol
      .aggregate([
        { $match: { ...notDeleted, createdAt: { $gte: monthStart } } },
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

    const months: string[] = []
    for (let i = 5; i >= 0; i--) {
      months.push(dayjs().subtract(i, 'month').format('YYYY-MM'))
    }

    const trendMap = new Map(monthTrendStats.map((item: any) => [item.date, item.count]))
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
        publishTrend: finalTrend,
        visitSummary: {
          totalVisits: visitSummary.totalVisits,
          uniqueVisitors: visitSummary.uniqueVisitors,
          todayVisits: visitSummary.todayVisits,
          averageDurationMs: visitSummary.averageDurationMs,
          latestVisitedAt: visitSummary.latestVisitedAt,
          topPaths: visitSummary.topPaths || [],
          days: 30
        }
      }
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
