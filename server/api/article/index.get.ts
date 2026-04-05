import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event) as any 
    const pageNum = Math.max(1, Number(q.page || 1))
    const pageSize = Math.max(1, Number(q.limit || 10))
    const keyword = String(q.q || '').trim()  // 搜索关键词，根据标题、标签、分类名称进行搜索
    const sort = String(q.sort || 'created').toLowerCase() // 排序方式：updated|created
    const offset = (pageNum - 1) * pageSize

    const db = getDb()
    const { articles } = getCollections(db)

    const matchDeleted: any = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }

    const pipeline: any[] = [
      { $match: matchDeleted },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: 'id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
    ]

    if (keyword) {
      const rx = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      pipeline.push({
        $match: {
          $or: [{ title: rx }, { tags: rx }, { 'category.name': rx }]
        }
      })
    }

    const sortStage =
      sort === 'created'
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
                tags: 1,
                category: { $ifNull: ['$category.name', ''] },
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

    const aggRes = await articles.aggregate(pipeline).toArray()
    const res0: any = aggRes?.[0] || { data: [], total: [] }
    const total = Number(res0?.total?.[0]?.value || 0)
    const data = (res0?.data || []).map((r: any) => ({
      ...r,
      id: String(r.id),
      tags: Array.isArray(r.tags) ? r.tags : []
    }))

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data, total, page: pageNum, limit: pageSize }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
