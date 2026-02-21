import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { execute, query, withTransaction } from '../../utils/db'
import { updateTagsCount, updateCategoryCount } from '../../utils/article-helpers'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ title: string; category: string; tags: string[]; content: string }>(event)
    const title = body?.title || ''
    const category = body?.category || ''
    const content = body?.content || ''
    const tagsStr = Array.isArray(body?.tags) ? body!.tags.join(',') : ''
    
    if (!title || !category || !content) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const data = await withTransaction(async (conn) => {
      const result: any = await execute(
        'INSERT INTO articles (title, tags, category_id, file_path) VALUES (?, ?, ?, ?)',
        [title, tagsStr, category, ''],
        conn
      )
      const id = result?.insertId
      
      // 写入文件到 public/md
      const mdDir = path.join(process.cwd(), 'public', 'md')
      const fileName = `article-${id}.md`
      const absPath = path.join(mdDir, fileName)
      const relPath = `/md/${fileName}`
      try {
        await fs.mkdir(mdDir, { recursive: true })
        await fs.writeFile(absPath, content, 'utf-8')
      } catch (e) {
        console.error('写入文章文件失败:', e)
        // 抛出错误以触发事务回滚
        throw new Error('文件写入失败')
      }
      
      await execute('UPDATE articles SET file_path = ? WHERE id = ?', [relPath, id], conn)
      
      // 更新标签和分类计数
      await updateTagsCount(null, tagsStr, conn)
      await updateCategoryCount(null, category, conn)

      const rows: any = await query('SELECT * FROM articles WHERE id = ?', [id], conn)
      return rows?.[0] || { id, title, file_path: relPath, tags: tagsStr, category_id: category }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '新增成功', data: data }
  } catch (error: any) {
    console.error('新增文章失败:', error)
    setResponseStatus(event, 500)
    const msg = error.message === '文件写入失败' ? '文件写入失败' : '服务器错误'
    return { status: 500, msg, data: null }
  }
})
