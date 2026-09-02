import { defineEventHandler, setResponseStatus } from 'h3'
import { getDb } from '../../utils/mongo'
import { getFriendLinkSelf } from '../../utils/friend-link-self'

export default defineEventHandler(async (event) => {
  try {
    const db = getDb()
    const data = await getFriendLinkSelf(db)
    setResponseStatus(event, 200)
    return { status: 200, msg: '查询成功', data }
  } catch (error) {
    console.error('查询本站友链信息失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
