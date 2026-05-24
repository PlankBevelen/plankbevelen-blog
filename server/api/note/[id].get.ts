import { defineEventHandler, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'
import { normalizeUploadsInContent } from '../../utils/content'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { notes } = getCollections(db)
    const note: any = await notes.findOne({
      id,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
    })
    if (!note) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '未找到笔记', data: null }
    }

    const data = {
      id: String(note.id),
      title: note.title,
      category: String(note.categoryId),
      chapter: String(note.chapter || ''),
      chapterOrder: Number(note.chapterOrder || 0),
      content: normalizeUploadsInContent(String(note.content || '')),
      createTime: note.createdAt,
      updateTime: note.updatedAt
    }

    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
