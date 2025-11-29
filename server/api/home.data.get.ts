import { query } from '../utils/db'
import { setResponseStatus, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const articlesSql = `
      SELECT a.id, a.title, a.tags, a.content, a.created_at, a.updated_at, a.category_id, c.name AS category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 10 OFFSET 0
    `
    const rows: any = await query(articlesSql)
    const articles = (rows || []).map((r: any) => ({
      id: String(r.id),
      title: r.title,
      tags: (r.tags || '').split(',').filter((t: string) => !!t),
      category: r.category_name || '',
      content: r.content,
      createTime: r.created_at,
      updateTime: r.updated_at,
    }))

    const categories: any = await query('SELECT id, name, count, created_at, updated_at FROM categories ORDER BY name ASC')
    const tags: any = await query('SELECT name, count FROM tags ORDER BY count DESC, name ASC')
    const articleCountRows: any = await query('SELECT COUNT(*) AS total FROM articles')
    const articleCount = Number(articleCountRows?.[0]?.total || 0)

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: '查询成功',
      data: {
        articles,
        categories,
        tags,
        stats: {
          articles: articleCount,
          categories: (categories || []).length,
          tags: (tags || []).length,
        }
      }
    }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
