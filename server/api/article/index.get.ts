import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event) as any 
    const pageNum = Math.max(1, Number(q.page || 1))
    const pageSize = Math.max(1, Number(q.limit || 10))
    const keyword = String(q.q || '').trim()  // 搜索关键词，根据标题、标签、分类名称进行搜索
    const offset = (pageNum - 1) * pageSize

    const params: any[] = []
    let where = ''
    if (keyword) {
      where = 'WHERE a.title LIKE ? OR a.tags LIKE ? OR c.name LIKE ?'
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }

    const listSql = `
      SELECT a.id, a.title, a.tags, a.content, a.created_at, a.updated_at, a.category_id, c.name AS category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${where}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `
    const countSql = `
      SELECT COUNT(*) AS total
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${where}
    `

    const listParams = keyword ? [...params, pageSize, offset] : [pageSize, offset]
    const countParams = keyword ? params : []

    const rows: any = await query(listSql, listParams)
    const countRows: any = await query(countSql, countParams)
    const total = Number(countRows?.[0]?.total || 0)

    const data = (rows || []).map((r: any) => ({
      id: String(r.id),
      title: r.title,
      tags: (r.tags || '').split(',').filter((t: string) => !!t),
      category: r.category_name || '',
      content: r.content,
      createTime: r.created_at,
      updateTime: r.updated_at,
    }))

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data, total, page: pageNum, limit: pageSize }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})

