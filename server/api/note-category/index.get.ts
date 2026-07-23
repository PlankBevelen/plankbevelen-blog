import { defineEventHandler, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const { noteCategories, notes } = getCollections(db)
    const rows = await noteCategories
      .find({}, { projection: { _id: 0, id: 1, name: 1, count: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ id: 1 })
      .toArray()

    const categoryIds = (rows || []).map((item) => String(item.id))
    const firstNoteByCategory = new Map<string, { id: string; title: string }>()

    if (categoryIds.length) {
      const firstNotes = await notes
        .aggregate([
          {
            $match: {
              categoryId: { $in: categoryIds },
              $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
            }
          },
          {
            $addFields: {
              chapterOrder: { $ifNull: ['$chapterOrder', 0] },
              noteOrder: { $ifNull: ['$noteOrder', 0] }
            }
          },
          { $sort: { chapterOrder: 1, noteOrder: 1, id: 1 } },
          {
            $group: {
              _id: '$categoryId',
              id: { $first: '$id' },
              title: { $first: '$title' }
            }
          }
        ])
        .toArray()

      for (const row of firstNotes) {
        firstNoteByCategory.set(String(row._id), {
          id: String(row.id),
          title: String(row.title || '')
        })
      }
    }

    const data = (rows || []).map((item) => {
      const firstNote = firstNoteByCategory.get(String(item.id))
      return {
        id: item.id,
        name: item.name,
        count: item.count || 0,
        createTime: item.createdAt,
        updateTime: item.updatedAt,
        firstNoteId: firstNote?.id || '',
        firstNoteTitle: firstNote?.title || ''
      }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
