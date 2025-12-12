import { defineEventHandler, setResponseStatus } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const rows: any = await query('SELECT * FROM articles WHERE id = ?', [id])
    const r = rows?.[0]
    if (!r) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '未找到文章', data: null }
    }

    // 获取上一条和下一条
    const prevRows: any = await query('SELECT id, title FROM articles WHERE id < ? ORDER BY id DESC LIMIT 1', [id])
    const nextRows: any = await query('SELECT id, title FROM articles WHERE id > ? ORDER BY id ASC LIMIT 1', [id])
    const prev = prevRows?.[0] ? { id: String(prevRows[0].id), title: prevRows[0].title } : null
    const next = nextRows?.[0] ? { id: String(nextRows[0].id), title: nextRows[0].title } : null

    const data = {
      id: String(r.id),
      title: r.title,
      tags: String(r.tags || '')
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => !!t),
      category: String(r.category_id),
      content: r.content,
      createTime: r.created_at,
      updateTime: r.updated_at,
      prev,
      next
    }

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})

