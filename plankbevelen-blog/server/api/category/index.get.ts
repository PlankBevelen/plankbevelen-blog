import { defineEventHandler } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
      const categories = await query('SELECT * FROM categories')
      setResponseStatus(event, 200)
      return {
        status: 200,
        msg: '查询成功',
        data: categories
      }
  } catch (error) {
    setResponseStatus(event, 400)
    return {
      status: 400,
      msg: '服务器错误',
      data: null
    }
  }
})
