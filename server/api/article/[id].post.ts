import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { execute, query } from '../../utils/db'
import { promises as fs } from 'node:fs'
import path from 'node:path'

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

    // 读取现有 file_path
    const rows0: any = await query('SELECT file_path FROM articles WHERE id = ?', [id])
    let filePath: string = rows0?.[0]?.file_path || ''
    if (!filePath) {
      // 如果没有路径，则创建新路径
      filePath = `/md/article-${id}.md`
      await execute('UPDATE articles SET file_path = ? WHERE id = ?', [filePath, id])
    }
    // 写入文件
    const absPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''))
    try {
      await fs.mkdir(path.dirname(absPath), { recursive: true })
      await fs.writeFile(absPath, content, 'utf-8')
    } catch (e) {
      console.error('更新文章文件失败:', e)
      setResponseStatus(event, 500)
      return { status: 500, msg: '文件写入失败', data: null }
    }
    await execute(
      'UPDATE articles SET title = ?, tags = ?, category_id = ? WHERE id = ?',
      [title, tags, category, id]
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
          content: content,
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

