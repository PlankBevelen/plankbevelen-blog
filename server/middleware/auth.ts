import { defineEventHandler, getHeader, setResponseStatus } from 'h3'
import jwt from 'jsonwebtoken'
import { readAccessToken, readCsrfCookie } from '../utils/auth-cookies'
import { safeEqualString } from '../utils/crypto-safe'

const ADMIN_EXEMPT = [
  '/api/admin/login',
  '/api/admin/captcha',
  '/api/admin/session',
  '/api/admin/logout',
]

const PROTECTED_MUTATION_PREFIXES = [
  '/api/article',
  '/api/category',
  '/api/tag/sync',
  '/api/upload',
]

function normalizePath(raw: string): string {
  let path = raw || '/'
  try {
    path = decodeURIComponent(path)
  } catch {
    // 解码失败保留原样
  }
  return path.replace(/\/{2,}/g, '/')
}

function headerHost(value: string): string {
  try {
    return new URL(value).host
  } catch {
    return ''
  }
}

export default defineEventHandler((event) => {
  const url = new URL(event.node.req.url || '/', 'http://localhost')
  const path = normalizePath(url.pathname)
  const method = (event.node.req.method || 'GET').toUpperCase()

  const isAdminAPI = path.startsWith('/api/admin')
  const isExempt = ADMIN_EXEMPT.some((p) => path === p)
  const isProtectedMutation =
    (method !== 'GET' && method !== 'HEAD') &&
    PROTECTED_MUTATION_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))

  if (!((isAdminAPI && !isExempt) || isProtectedMutation)) {
    return
  }

  const config = useRuntimeConfig()
  const secret = config.authSecret as string
  if (!secret) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器未配置认证密钥' }
  }

  // CSRF：非 GET 做 Origin/Referer 同源校验 + X-CSRF-Token 双提交
  if (method !== 'GET' && method !== 'HEAD') {
    const host = getHeader(event, 'host') || ''
    const origin = getHeader(event, 'origin') || ''
    const referer = getHeader(event, 'referer') || ''
    const sourceHost = headerHost(origin) || headerHost(referer)
    if (!sourceHost || sourceHost !== host) {
      setResponseStatus(event, 403)
      return { status: 403, msg: '跨站请求被拒绝' }
    }

    const csrfCookie = readCsrfCookie(event)
    const csrfHeader = getHeader(event, 'x-csrf-token') || ''
    if (!csrfCookie || !csrfHeader || !safeEqualString(csrfCookie, csrfHeader)) {
      setResponseStatus(event, 403)
      return { status: 403, msg: 'CSRF 校验失败' }
    }
  }

  // JWT 只从 httpOnly Cookie 读
  const token = readAccessToken(event)
  if (!token) {
    setResponseStatus(event, 401)
    return { status: 401, msg: '未登录或登录过期' }
  }

  try {
    const payload = jwt.verify(token, secret) as { sub?: string }
    event.context.auth = {
      username: payload.sub,
      timestamp: Date.now().toString(),
    }
  } catch {
    setResponseStatus(event, 401)
    return { status: 401, msg: '登录已失效，请重新登录' }
  }
})
