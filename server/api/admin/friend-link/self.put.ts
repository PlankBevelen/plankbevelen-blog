import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { getDb } from '../../../utils/mongo'
import { updateFriendLinkSelf } from '../../../utils/friend-link-self'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ name?: string; url?: string; description?: string; avatar?: string }>(event)
    const db = getDb()
    const data = await updateFriendLinkSelf(body || {}, db)
    setResponseStatus(event, 200)
    return { status: 200, msg: '更新成功', data }
  } catch (error) {
    console.error('更新本站友链信息失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
