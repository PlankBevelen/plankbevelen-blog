import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const q = getQuery(event) as any
    const categoryId = String(q.categoryId || '').trim()
    if (!categoryId) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { notes } = getCollections(db)
    const rows = await notes
      .find(
        {
          categoryId,
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
        },
        {
          projection: {
            _id: 0,
            chapter: 1,
            chapterOrder: 1
          }
        }
      )
      .toArray()

    const map = new Map<string, number>()
    for (const row of rows) {
      const chapter = String(row.chapter || '').trim()
      if (!chapter) continue
      const order = Number(row.chapterOrder || 0)
      const prev = map.get(chapter)
      if (prev === undefined || order < prev) {
        map.set(chapter, order)
      }
    }

    const data = Array.from(map.entries())
      .map(([name, chapterOrder]) => ({ name, chapterOrder }))
      .sort((a, b) => a.chapterOrder - b.chapterOrder || a.name.localeCompare(b.name, 'zh-CN'))

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
