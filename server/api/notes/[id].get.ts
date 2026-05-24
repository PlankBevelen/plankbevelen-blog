import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'
import { normalizeUploadsInContent } from '../../utils/content'

function buildSummary(content: string, limit = 140) {
  return String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit)
}

export default defineEventHandler(async (event) => {
  try {
    const categoryId = String(event?.context?.params?.id || '').trim()
    const query = getQuery(event) as any
    const noteId = Number(query.noteId || 0)

    if (!categoryId) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { notes, noteCategories } = getCollections(db)
    const [categoryRows, noteRows] = await Promise.all([
      noteCategories.find({}, { projection: { _id: 0, id: 1, name: 1, count: 1 } }).sort({ id: 1 }).toArray(),
      notes.aggregate([
        {
          $match: {
            categoryId,
            $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
          }
        },
        {
          $lookup: {
            from: 'note_categories',
            localField: 'categoryId',
            foreignField: 'id',
            as: 'category'
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $sort: { categoryId: 1, createdAt: 1, id: 1 } },
        {
          $project: {
            _id: 0,
            id: 1,
            title: 1,
            chapter: 1,
            chapterOrder: { $ifNull: ['$chapterOrder', 0] },
            content: 1,
            categoryId: 1,
            categoryName: { $ifNull: ['$category.name', '未分类'] },
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]).toArray()
    ])

    if (!noteRows.length) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '未找到该分类下的笔记', data: null }
    }

    const current = (noteId
      ? noteRows.find((item: any) => Number(item.id) === noteId)
      : null) || noteRows[0]
    const notesByChapter = new Map<string, { chapterOrder: number, items: any[] }>()
    for (const note of noteRows || []) {
      const chapter = String(note.chapter || '未命名章节')
      const currentGroup = notesByChapter.get(chapter)
      const nextOrder = Number(note.chapterOrder || 0)
      if (!currentGroup) {
        notesByChapter.set(chapter, { chapterOrder: nextOrder, items: [note] })
        continue
      }
      currentGroup.items.push(note)
      currentGroup.chapterOrder = Math.min(currentGroup.chapterOrder, nextOrder)
    }

    const navGroups = Array.from(notesByChapter.entries())
      .map(([chapter, group]) => ({
        id: `${categoryId}:${chapter}`,
        title: chapter,
        count: group.items.length,
        chapterOrder: Number(group.chapterOrder || 0),
        items: group.items.map((item: any) => ({
          id: String(item.id),
          title: String(item.title || ''),
          summary: buildSummary(String(item.content || '')),
          updateTime: item.updatedAt
        }))
      }))
      .sort((a, b) => a.chapterOrder - b.chapterOrder || a.title.localeCompare(b.title, 'zh-CN'))

    const currentCategory = (categoryRows || []).find((item: any) => String(item.id) === categoryId)
    const currentGroupId = `${categoryId}:${String(current.chapter || '未命名章节')}`

    const data = {
      article: {
        id: String(current.id),
        title: String(current.title || ''),
        category: String(categoryId),
        categoryName: String(currentCategory?.name || current.categoryName || '未分类'),
        chapter: String(current.chapter || '未命名章节'),
        chapterOrder: Number(current.chapterOrder || 0),
        content: normalizeUploadsInContent(String(current.content || '')),
        createTime: current.createdAt,
        updateTime: current.updatedAt
      },
      navGroups,
      currentGroupId,
      siblingNotes: noteRows.map((item: any) => ({
        id: String(item.id),
        title: String(item.title || ''),
        chapter: String(item.chapter || '未命名章节')
      }))
    }

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
