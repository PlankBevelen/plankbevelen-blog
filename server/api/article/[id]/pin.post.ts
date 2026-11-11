import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { getDb, getCollections } from '../../../utils/mongo'

const notDeleted = { $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    const body = await readBody<{ pinned?: boolean }>(event)
    if (!id || typeof body?.pinned !== 'boolean') {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { articles } = getCollections(db)
    const pinned = body.pinned
    const pinnedAt = pinned ? new Date() : null
    const result = await articles.updateOne(
      { id, ...notDeleted },
      { $set: { pinned, pinnedAt } }
    )

    if (!result.matchedCount) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '未找到文章', data: null }
    }

    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: pinned ? '已置顶' : '已取消置顶',
      data: { id: String(id), pinned, pinnedAt }
    }
  } catch (error) {
    console.error('更新文章置顶失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
