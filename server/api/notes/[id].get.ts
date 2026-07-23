import { defineEventHandler, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'
import { normalizeUploadsInContent } from '../../utils/content'
import { buildNoteNav } from '../../utils/note-helpers'

export default defineEventHandler(async (event) => {
  try {
    const noteId = Number(event?.context?.params?.id || 0)
    if (!noteId) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { notes, noteCategories } = getCollections(db)
    const current: any = await notes.findOne({
      id: noteId,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
    })

    if (!current) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '未找到笔记', data: null }
    }

    const categoryId = String(current.categoryId || '').trim()
    const [categoryDoc, navRows] = await Promise.all([
      categoryId
        ? noteCategories.findOne({ id: categoryId }, { projection: { _id: 0, id: 1, name: 1 } })
        : Promise.resolve(null),
      notes
        .find(
          {
            categoryId,
            $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
          },
          {
            projection: {
              _id: 0,
              id: 1,
              title: 1,
              chapter: 1,
              chapterOrder: 1,
              noteOrder: 1
            }
          }
        )
        .toArray()
    ])

    const { flatItems, navGroups } = buildNoteNav(categoryId, navRows as any[])
    const chapter = String(current.chapter || '').trim()
    const notePayload = {
      id: String(current.id),
      title: String(current.title || ''),
      category: categoryId,
      categoryName: String(categoryDoc?.name || '未分类'),
      chapter,
      chapterOrder: Number(current.chapterOrder || 0),
      noteOrder: Number(current.noteOrder || 0),
      content: normalizeUploadsInContent(String(current.content || '')),
      createTime: current.createdAt,
      updateTime: current.updatedAt
    }

    const data = {
      note: notePayload,
      // 兼容旧前端字段
      article: notePayload,
      flatItems,
      navGroups,
      currentGroupId: chapter ? `${categoryId}:${chapter}` : '',
      siblingNotes: (navRows || []).map((item: any) => ({
        id: String(item.id),
        title: String(item.title || ''),
        chapter: String(item.chapter || '').trim()
      }))
    }

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
