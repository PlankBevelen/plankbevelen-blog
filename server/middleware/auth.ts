import { defineEventHandler, getHeader, setResponseStatus } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  const url = new URL(event.node.req.url || '/', 'http://localhost')
  const path = url.pathname
  const method = event.node.req.method || 'GET'

  // 拦截需要 admin 权限的 API
  const protectedMutationRoutes = [
    '/api/article',
    '/api/category',
    '/api/note',
    '/api/note-category',
    '/api/tag/sync',
    '/api/upload'
  ]
  const isAdminAPI = path.startsWith('/api/admin') && path !== '/api/admin/login'
  const isProtectedMutation = method !== 'GET'
    && method !== 'HEAD'
    && protectedMutationRoutes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  const isProtectedAPI = isAdminAPI || isProtectedMutation

  if (!isProtectedAPI) {
    return
  }
  
  const token = (getHeader(event, 'token') as string | undefined) || ''
  if (!token) {
    setResponseStatus(event, 401)
    return { code: 'UNAUTHORIZED', message: '未登录或登录过期' }
  }
  const secret = (useRuntimeConfig().authSecret as string) || 'dev-secret'
  try {
    const payload = jwt.verify(token, secret) as any
    event.context.auth = {
      username: payload.sub,
      timestamp: Date.now().toString()
    }
  } catch (e: any) {
    setResponseStatus(event, 401)
    return { 
      code: 'INVALID_TOKEN',
      message: 'Token 验证失败或已过期'
    }
  }
})
