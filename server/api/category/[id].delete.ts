import { defineEventHandler, setResponseStatus } from 'h3'
import { execute } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }
    await execute('DELETE FROM categories WHERE id = ?', [id])
    setResponseStatus(event, 200)
    return { status: 200, msg: '删除成功', data: { id } }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
