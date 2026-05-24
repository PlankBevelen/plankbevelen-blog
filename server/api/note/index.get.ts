import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'

function sliceMdSafely(content: string, length: number) {
  if (content.length <= length) return content
  let sliced = content.slice(0, length)
  const fenceCount = (sliced.match(/```/g) || []).length
  if (fenceCount % 2 !== 0) sliced += '\n```'
  return sliced
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event) as any
    const pageNum = Math.max(1, Number(q.page || 1))
    const pageSize = Math.max(1, Number(q.limit || 10))
    const keyword = String(q.q || '').trim()
    const sort = String(q.sort || 'updated').toLowerCase()
    const categoryId = String(q.categoryId || '').trim()
    const offset = (pageNum - 1) * pageSize

    const db = getDb()
    const { notes } = getCollections(db)
    const notDeleted: any = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }

    const pipeline: any[] = [
      { $match: notDeleted },
      {
        $lookup: {
          from: 'note_categories',
          localField: 'categoryId',
          foreignField: 'id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
    ]

    if (categoryId) {
      pipeline.push({ $match: { categoryId } })
    }

    if (keyword) {
      const rx = new RegExp(escapeRegExp(keyword), 'i')
      pipeline.push({
        $match: {
          $or: [{ title: rx }, { 'category.name': rx }]
        }
      })
    }

    const sortStage = sort === 'created'
      ? { createdAt: -1, id: -1 }
      : { updatedAt: -1, createdAt: -1, id: -1 }

    pipeline.push(
      { $sort: sortStage },
      {
        $facet: {
          data: [
            { $skip: offset },
            { $limit: pageSize },
            {
              $project: {
                _id: 0,
                id: 1,
                title: 1,
                chapter: 1,
                chapterOrder: { $ifNull: ['$chapterOrder', 0] },
                category: { $ifNull: ['$category.name', '未分类'] },
                categoryId: 1,
                content: 1,
                createTime: '$createdAt',
                updateTime: '$updatedAt'
              }
            }
          ],
          total: [{ $count: 'value' }]
        }
      }
    )

    const aggregateRows = await notes.aggregate(pipeline).toArray()
    const result0: any = aggregateRows?.[0] || { data: [], total: [] }
    const total = Number(result0?.total?.[0]?.value || 0)

    const data = (result0?.data || []).map((row: any) => ({
      id: String(row.id),
      title: String(row.title || ''),
      chapter: String(row.chapter || ''),
      chapterOrder: Number(row.chapterOrder || 0),
      category: String(row.category || ''),
      categoryId: String(row.categoryId || ''),
      createTime: row.createTime,
      updateTime: row.updateTime,
      shortContent: sliceMdSafely(String(row.content || ''), 300),
      longContent: sliceMdSafely(String(row.content || ''), 600)
    }))

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data, total, page: pageNum, limit: pageSize }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
