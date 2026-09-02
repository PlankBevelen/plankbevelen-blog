import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../utils/mongo'

function sliceMdSafely(content: string, length: number): string {
  if (content.length <= length) return content

  // 找出所有围栏标记的位置，配对成 [开, 闭] 区间
  const fences: number[] = []
  const re = /^[ \t]*```/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    fences.push(m.index)
  }

  let cut = length

  for (let i = 0; i < fences.length; i += 2) {
    const open = fences[i]!
    const close = fences[i + 1]

    // 截断点在这个围栏开始之前，后面的围栏更靠后，不用再看
    if (cut <= open) break

    // 围栏没有闭合标记（文档本身不完整），从开始处截掉
    if (close === undefined) {
      cut = open
      break
    }

    // 闭合行的末尾：包含 ``` 三个字符本身
    const closeEnd = close + content.slice(close).indexOf('```') + 3

    // 截断点落在围栏内部 —— 退到围栏之前，别留半个代码块
    if (cut < closeEnd) {
      cut = open
      break
    }
  }

  return content.slice(0, cut).trimEnd()
}

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event) as any 
    const pageNum = Math.max(1, Number(q.page || 1))
    const pageSize = Math.min(50, Math.max(1, Number(q.limit || 10) || 10))
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
      id: String(r.id),
      title: r.title,
      tags: Array.isArray(r.tags) ? r.tags : [],
      category: r.category,
      createTime: r.createTime,
      updateTime: r.updateTime,
      shortContent: sliceMdSafely(r.content || '', 600),
      longContent: sliceMdSafely(r.content || '', 2000),
    }))

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data, total, page: pageNum, limit: pageSize }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
