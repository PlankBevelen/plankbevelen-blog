import type { H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { readAccessToken } from '../../utils/auth-cookies'
import { getRuntimeSettings } from '../../core/runtime-settings'

/** 公开接口上可选识别后台登录。未登录或 token 无效都当访客，不报错。 */
export async function isAdminRequest(event: H3Event): Promise<boolean> {
  try {
    const settings = await getRuntimeSettings()
    if (!settings.authSecret) return false
    const token = readAccessToken(event)
    if (!token) return false
    jwt.verify(token, settings.authSecret)
    return true
  } catch {
    return false
  }
}
