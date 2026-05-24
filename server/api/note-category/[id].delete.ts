import { defineEventHandler, setResponseStatus } from 'h3'
import { getCollections, getDb } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const id = String(event?.context?.params?.id || '').trim()
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const db = getDb()
    const { noteCategories, notes } = getCollections(db)
    const usedCount = await notes.countDocuments({
      categoryId: id,
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }]
    })
    if (usedCount > 0) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '该分类下存在笔记，无法删除', data: null }
    }

    const deleteResult = await noteCategories.deleteOne({ id })
    if (!deleteResult.deletedCount) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '分类不存在', data: null }
    }

    setResponseStatus(event, 200)
    return { status: 200, msg: '删除成功', data: { id } }
  } catch {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
