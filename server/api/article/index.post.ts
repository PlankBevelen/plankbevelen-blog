import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { execute, query, withTransaction } from '../../utils/db'
import { updateTagsCount, updateCategoryCount } from '../../utils/article-helpers'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getUploadsBaseDir } from '../../utils/uploads'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ title: string; category: string; tags: string[]; content: string; tempId?: string }>(event)
    const title = body?.title || ''
    const category = body?.category || ''
    let content = body?.content || ''
    const tempId = body?.tempId || ''
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
      
      let finalContent = content
      if (tempId && tempId.trim()) {
        const uploadsBase = getUploadsBaseDir()
        const tempDir = path.join(uploadsBase, 'temp', tempId)
        const legacyTempDir = path.join(uploadsBase, tempId)
        const targetDir = path.join(uploadsBase, id.toString())
        
        try {
          let sourceDir = tempDir
          try {
            await fs.access(sourceDir)
          } catch {
            sourceDir = legacyTempDir
            await fs.access(sourceDir)
          }
          try {
            await fs.rename(sourceDir, targetDir)
          } catch (err: any) {
            if (err && err.code === 'EXDEV') {
              await (fs as any).cp(sourceDir, targetDir, { recursive: true })
              await (fs as any).rm(sourceDir, { recursive: true, force: true })
            } else {
              throw err
            }
          }
          
          finalContent = finalContent
            .replace(new RegExp(`/uploads/temp/${tempId}/`, 'g'), `/uploads/${id}/`)
            .replace(new RegExp(`/uploads/${tempId}/`, 'g'), `/uploads/${id}/`)
        } catch (e) {
          // Ignore if temp dir doesn't exist
        }
      }

      // 写入文件到 public/md
      const mdDir = path.join(process.cwd(), 'public', 'md')
      const fileName = `article-${id}.md`
      const absPath = path.join(mdDir, fileName)
      const relPath = `/md/${fileName}`
      try {
        await fs.mkdir(mdDir, { recursive: true })
        await fs.writeFile(absPath, finalContent, 'utf-8')
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
