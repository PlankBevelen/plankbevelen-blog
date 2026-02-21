import { defineEventHandler, setResponseStatus } from 'h3'
import { query } from '../../utils/db'
import dayjs from 'dayjs'

export default defineEventHandler(async (event) => {
  try {
    // 1. 基础计数
    const [totalArticles] = await query<any>('SELECT COUNT(*) as count FROM articles')
    const [totalCategories] = await query<any>('SELECT COUNT(*) as count FROM categories')
    const [totalTags] = await query<any>('SELECT COUNT(*) as count FROM tags')

    // 2. 最近文章 (Top 5)
    const recentArticles = await query<any>('SELECT id, title, created_at, category_id FROM articles ORDER BY created_at DESC LIMIT 5')

    // 3. 分类统计 (Top 10)
    const categoryStats = await query<any>('SELECT name, count as value FROM categories ORDER BY count DESC LIMIT 10')

    // 4. 标签统计 (Top 10)
    const tagStats = await query<any>('SELECT name, count as value FROM tags ORDER BY count DESC LIMIT 10')

    // 5. 发布趋势 (最近 6 个月)
    // 注意：这里使用简单的 SQL 分组，可能需要根据实际数据库方言调整
    // MySQL 8.0+ 支持 DATE_FORMAT
    const trendStats = await query<any>(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as date, COUNT(*) as count
      FROM articles
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY date
      ORDER BY date ASC
    `)

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
        totalArticles: totalArticles?.count || 0,
        totalCategories: totalCategories?.count || 0,
        totalTags: totalTags?.count || 0,
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
