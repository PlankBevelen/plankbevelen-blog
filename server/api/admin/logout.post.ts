import { defineEventHandler, setResponseStatus } from 'h3'
import { clearAuthCookies } from '../../core/auth-cookies'
import { getRuntimeSettings } from '../../core/runtime-settings'

export default defineEventHandler(async (event) => {
  // 先对齐运行时 Cookie 名，再清。无论 JWT 是否已失效都清除两枚 Cookie
  await getRuntimeSettings()
  clearAuthCookies(event)
  setResponseStatus(event, 200)
  return { status: 200, msg: '已退出登录' }
})
