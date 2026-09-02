import { defineEventHandler, setResponseStatus } from 'h3'
import { clearAuthCookies } from '../../utils/auth-cookies'

export default defineEventHandler((event) => {
  // 无论 JWT 是否已失效，都清除两枚 Cookie
  clearAuthCookies(event)
  setResponseStatus(event, 200)
  return { status: 200, msg: '已退出登录' }
})
