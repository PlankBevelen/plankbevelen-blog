import { defineEventHandler, setResponseStatus } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const rows: any = await query('SELECT `name`, `count` FROM `tags` ORDER BY `count` DESC, `name` ASC')
    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data: rows || [] }
  } catch (error) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})

