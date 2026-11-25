/** 需要登录的后台接口。登录、验证码、读会话、退出不进这道门。 */
export const ADMIN_EXEMPT_PATHS = [
  '/api/admin/login',
  '/api/admin/captcha',
  '/api/admin/session',
  '/api/admin/logout',
] as const

/** 这些前缀下的非 GET/HEAD 请求要做同源和 CSRF 校验。匹配到前缀本身，或前缀加 `/`。 */
export const GUARDED_MUTATION_PREFIXES = [
  '/api/article',
  '/api/category',
  '/api/tag/sync',
  '/api/upload',
] as const

export function normalizeRequestPath(raw: string): string {
  let path = raw || '/'
  try {
    path = decodeURIComponent(path)
  } catch {
    // 非法百分号编码保留原样，避免请求直接 500
  }
  return path.replace(/\/{2,}/g, '/')
}

export function headerHost(value: string): string {
  try {
    return new URL(value).host
  } catch {
    return ''
  }
}

/**
 * 写请求的来源是否跨站。
 * Origin 能解析时以它为准；Origin 为空或不是 URL 时才退回 Referer。
 */
export function isCrossSiteWrite(host: string, origin: string, referer: string): boolean {
  const sourceHost = headerHost(origin) || headerHost(referer)
  return !sourceHost || sourceHost !== host
}

/** 是否进入鉴权中间件：后台接口，或受保护前缀上的写操作。 */
export function isGuardedRoute(pathname: string, method: string): boolean {
  const path = normalizeRequestPath(pathname)
  const verb = (method || 'GET').toUpperCase()
  const isAdminAPI = path.startsWith('/api/admin')
  const isExempt = ADMIN_EXEMPT_PATHS.some((item) => path === item)
  const isProtectedMutation =
    verb !== 'GET' &&
    verb !== 'HEAD' &&
    GUARDED_MUTATION_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  return (isAdminAPI && !isExempt) || isProtectedMutation
}
