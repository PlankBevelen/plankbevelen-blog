import { defineEventHandler, setResponseStatus } from 'h3'
import { execute, query, withTransaction } from '../../utils/db'
import { updateTagsCount, updateCategoryCount } from '../../utils/article-helpers'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    await withTransaction(async (conn) => {
      // 1. Get old data
      const rows0: any = await query('SELECT * FROM articles WHERE id = ?', [id], conn)
      const oldArticle = rows0?.[0]
      if (!oldArticle) return // Already deleted?
      
      // 2. Delete Article
      await execute('DELETE FROM articles WHERE id = ?', [id], conn)
      
      // 3. Update Counts
      await updateTagsCount(oldArticle.tags, null, conn)
      await updateCategoryCount(oldArticle.category_id, null, conn)
      
      // 4. Delete File
      if (oldArticle.file_path) {
          const absPath = path.join(process.cwd(), 'public', oldArticle.file_path.replace(/^\//, ''))
          try {
              await fs.unlink(absPath)
          } catch (e) {
              console.error('Delete file failed:', e)
              // File missing is not critical enough to rollback DB delete
          }
      }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '删除成功', data: { id } }
  } catch (error) {
    console.error('删除文章失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
