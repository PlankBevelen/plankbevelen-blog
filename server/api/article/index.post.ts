import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { withTransaction, getCollections, getNextSequence } from '../../utils/mongo'
import { updateTagsCount, updateCategoryCount } from '../../utils/article-helpers'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getUploadsBaseDir } from '../../utils/uploads'
import { normalizeUploadsInContent } from '../../utils/content'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ title: string; category: string; tags: string[]; content: string; tempId?: string }>(event)
    const title = body?.title || ''
    const category = body?.category || ''
    let content = body?.content || ''
    const tempId = body?.tempId || ''
    const tagsArr = Array.isArray(body?.tags) ? body!.tags : []
    
    if (!title || !category || !content) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const categoryId = Number(category)
    if (!categoryId) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const data = await withTransaction(async (ctx) => {
      const { articles } = getCollections(ctx.db)
      const id = await getNextSequence('articles', ctx)
      
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

      finalContent = normalizeUploadsInContent(finalContent)
      
      // 更新标签和分类计数
      await updateTagsCount(null, tagsArr, ctx)
      await updateCategoryCount(null, categoryId, ctx)

      const now = new Date()
      await articles.insertOne(
        {
          id,
          title,
          tags: tagsArr.map(t => String(t).trim()).filter(Boolean),
          categoryId,
          content: finalContent,
          createdAt: now,
          updatedAt: now
        },
        ctx.session ? { session: ctx.session } : undefined
      )

      return {
        id: String(id),
        title,
        tags: tagsArr.map(t => String(t).trim()).filter(Boolean),
        category: String(categoryId),
        content: finalContent,
        createTime: now,
        updateTime: now
      }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '新增成功', data: data }
  } catch (error: any) {
    console.error('新增文章失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
