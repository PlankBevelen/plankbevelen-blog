import { defineEventHandler, readBody } from 'h3'
import { execute, query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    const body = await readBody<{ name: string }>(event)
    const name = body?.name?.trim()
    if (!id || !name) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }
    await execute('UPDATE categories SET name = ? WHERE id = ?', [name, id])
    const rows: any = await query('SELECT * FROM categories WHERE id = ?', [id])
    setResponseStatus(event, 200)
    return { status: 200, msg: '更新成功', data: rows?.[0] || { id, name } }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
