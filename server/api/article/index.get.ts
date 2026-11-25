import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { pinnedRankStage, sortPinnedFirst } from '../../utils/article-pin'
import { getDb, getCollections } from '../../utils/mongo'
import { clampPage, clampPageSize, toArticleListItem } from '../../modules/article/payload'

const notDeleted = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event) as Record<string, unknown>
    const pageNum = clampPage(q.page)
    const pageSize = clampPageSize(q.limit)
    const keyword = String(q.q || '').trim()
    const sort = String(q.sort || 'created').toLowerCase()
    const offset = (pageNum - 1) * pageSize

    const db = getDb()
    const { articles } = getCollections(db)

    const pipeline: any[] = [
      { $match: notDeleted },
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
        ? sortPinnedFirst({ createdAt: -1, id: -1 })
        : sortPinnedFirst({ updatedAt: -1, createdAt: -1, id: -1 })

    pipeline.push(
      pinnedRankStage,
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
                excerpt: 1,
                previewHtml: 1,
                cover: 1,
                createTime: '$createdAt',
                updateTime: '$updatedAt',
                pinned: { $eq: ['$pinned', true] }
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
    const data = (res0?.data || []).map((row) => toArticleListItem(row))

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data, total, page: pageNum, limit: pageSize }
  } catch (error) {
    console.error('查询文章列表失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
