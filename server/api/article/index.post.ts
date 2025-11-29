import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { execute, query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ title: string; category: string; tags: string[]; content: string }>(event)
    const title = body?.title || ''
    const category = body?.category || ''
    const content = body?.content || ''
    const tags = Array.isArray(body?.tags) ? body!.tags.join(',') : ''
    if (!title || !category || !content) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const result: any = await execute(
      'INSERT INTO articles (title, content, tags, category_id) VALUES (?, ?, ?, ?)',
      [title, content, tags, category]
    )
    const id = result?.insertId
    const rows: any = await query('SELECT * FROM articles WHERE id = ?', [id])
    setResponseStatus(event, 200)
    return { status: 200, msg: '新增成功', data: rows?.[0] || { id, title, content, tags, category_id: category } }
  } catch (error) {
    console.error('新增文章失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
