import { setResponseStatus, defineEventHandler } from 'h3'
import { getDb, getCollections } from '../utils/mongo'

// 按字符数截断，但保证不截断在代码块中间
// 避免截出半个 ``` 导致 MdPreview 渲染异常
function sliceMdSafely(content: string, length: number): string {
  if (content.length <= length) return content
  let sliced = content.slice(0, length)
  // 统计截断后的代码块开合数量，奇数说明截在代码块内，补一个闭合
  const fenceCount = (sliced.match(/```/g) || []).length
  if (fenceCount % 2 !== 0) {
    sliced += '\n```'
  }
  return sliced
}

async function getArticles(limit: number, sort: 'created' | 'updated' = 'updated') {
  const db = getDb()
  const { articles } = getCollections(db)

  const sortStage =
    sort === 'created'
      ? { createdAt: -1, id: -1 }
      : { updatedAt: -1, createdAt: -1, id: -1 }

  const rows: any = await articles
    .aggregate([
      { $match: { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: 'id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: sortStage },
      { $limit: limit },
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
    ])
    .toArray()

  return (rows || []).map((r: any) => ({
    id: String(r.id),
    title: r.title,
    tags: Array.isArray(r.tags) ? r.tags : [],
    category: r.category,
    createTime: r.createTime,
    updateTime: r.updateTime,
    // 折叠态：前 600 字符，保证代码块不被截断
    shortContent: sliceMdSafely(r.content || '', 600),
    // 展开态：前 2000 字符
    longContent: sliceMdSafely(r.content || '', 2000),
    // 不返回完整 content，减少传输量
  }))
}

export default defineEventHandler(async (event) => {
  try {
    const articles = await getArticles(10, 'updated')

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: '查询成功',
      data: {
        articles
      }
    }
  } catch (error: any) {
    console.error('Home data error:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误: ' + (error?.message || '未知错误'), data: null }
  }
})