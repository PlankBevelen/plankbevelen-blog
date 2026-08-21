import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getCollections, withTransaction } from '../../utils/mongo'
import { getUploadsBaseDir } from '../../utils/uploads'
import { normalizeUploadsInContent } from '../../utils/content'
import { assertSafeTempId, resolveTempDir } from '../../utils/temp-id'
import { updateNoteCategoryCount } from '../../utils/note-helpers'
import { Snowflake } from '../../utils/snowflake'

const noteSnowflake = new Snowflake(1, 1)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      title: string
      category: string
      chapter: string
      chapterOrder?: number | string
      noteOrder?: number | string
      content: string
      tempId?: string
    }>(event)

    const title = String(body?.title || '').trim()
    const category = String(body?.category || '').trim()
    const chapter = String(body?.chapter || '').trim()
    const chapterOrder = chapter ? Number(body?.chapterOrder ?? 0) : 0
    const noteOrder = Number(body?.noteOrder ?? 0)
    let content = String(body?.content || '')
    const tempId = String(body?.tempId || '').trim()
    if (tempId && !assertSafeTempId(tempId)) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    if (
      !title ||
      !category ||
      !content ||
      Number.isNaN(chapterOrder) ||
      Number.isNaN(noteOrder)
    ) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const data = await withTransaction(async (ctx) => {
      const { notes, noteCategories } = getCollections(ctx.db)
      const categoryDoc = await noteCategories.findOne(
        { id: category },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (!categoryDoc) {
        const error: any = new Error('分类不存在')
        error.statusCode = 404
        throw error
      }

      const id = Number(noteSnowflake.nextId())

      let finalContent = content
      if (tempId) {
        const uploadsBase = getUploadsBaseDir()
        const tempDir = resolveTempDir(tempId)
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
          } catch (error: any) {
            if (error?.code === 'EXDEV') {
              await (fs as any).cp(sourceDir, targetDir, { recursive: true })
              await (fs as any).rm(sourceDir, { recursive: true, force: true })
            } else {
              throw error
            }
          }
          finalContent = finalContent
            .replace(new RegExp(`/uploads/temp/${tempId}/`, 'g'), `/uploads/${id}/`)
            .replace(new RegExp(`/uploads/${tempId}/`, 'g'), `/uploads/${id}/`)
        } catch {
          // ignore missing temp folder
        }
      }

      finalContent = normalizeUploadsInContent(finalContent)
      await updateNoteCategoryCount(null, category, ctx)

      const now = new Date()
      await notes.insertOne(
        {
          id,
          title,
          categoryId: category,
          chapter,
          chapterOrder,
          noteOrder,
          content: finalContent,
          createdAt: now,
          updatedAt: now
        },
        ctx.session ? { session: ctx.session } : undefined
      )

      return {
        id: String(id),
        title,
        category,
        chapter,
        chapterOrder,
        noteOrder,
        content: finalContent,
        createTime: now,
        updateTime: now
      }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '新增成功', data }
  } catch (error: any) {
    if (Number(error?.statusCode) === 404) {
      console.error('新增笔记失败（404）:', error?.message || error)
      setResponseStatus(event, 404)
      return { status: 404, msg: '分类不存在', data: null }
    }
    console.error('新增笔记失败:', error?.message || error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
