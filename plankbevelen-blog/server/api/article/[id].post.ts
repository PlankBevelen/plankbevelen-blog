import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { execute, query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    const body = await readBody<{ title: string; category: string; tags: string[]; content: string }>(event)
    const title = body?.title || ''
    const category = body?.category || ''
    const content = body?.content || ''
    const tags = Array.isArray(body?.tags) ? body!.tags.join(',') : ''

    if (!id || !title || !category || !content) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    await execute(
      'UPDATE articles SET title = ?, content = ?, tags = ?, category_id = ? WHERE id = ?',
      [title, content, tags, category, id]
    )
    const rows: any = await query('SELECT * FROM articles WHERE id = ?', [id])
    const r = rows?.[0]

    const data = r
      ? {
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
        }
      : { id: String(id), title, tags: (tags || '').split(','), category: String(category), content }

    setResponseStatus(event, 200)
    return { status: 200, msg: '更新成功', data }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})

