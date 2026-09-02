import { randomUUID } from 'node:crypto'
import { defineEventHandler, getHeader, getRequestIP, getRequestURL } from 'h3'
import { getCollections, getDb } from '../utils/mongo'

const EXCLUDED_PREFIXES = [
  '/api',
  '/admin',
  '/_nuxt',
  '/img',
  '/ico',
  '/uploads',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
]

const STATIC_FILE_RE = /\.[a-z0-9]+$/i

function parseDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase()
  if (!ua) return 'unknown'
  if (/(bot|spider|crawler|slurp|bingpreview)/i.test(ua)) return 'bot'
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) return 'tablet'
  if (/(mobile|iphone|ipod|android|blackberry|iemobile|opera mini)/i.test(ua)) return 'mobile'
  return 'desktop'
}

function parseBrowser(userAgent: string) {
  if (/edg\//i.test(userAgent)) return 'Edge'
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) return 'Chrome'
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return 'Safari'
  if (/firefox\//i.test(userAgent)) return 'Firefox'
  if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) return 'Opera'
  return 'Unknown'
}

function parseOS(userAgent: string) {
  if (/windows/i.test(userAgent)) return 'Windows'
  if (/android/i.test(userAgent)) return 'Android'
  if (/(iphone|ipad|ipod)/i.test(userAgent)) return 'iOS'
  if (/mac os x/i.test(userAgent)) return 'macOS'
  if (/linux/i.test(userAgent)) return 'Linux'
  return 'Unknown'
}

function shouldTrackRequest(pathname: string, accept: string, method: string) {
  if (method !== 'GET') return false
  if (!accept.includes('text/html')) return false
  if (EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix))) return false
  if (STATIC_FILE_RE.test(pathname)) return false
  return true
}

function shouldTrustProxy(event: any): boolean {
  if (process.env.TRUST_PROXY === '1') return true
  const trustedIps = String(process.env.TRUSTED_PROXY_IPS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!trustedIps.length) return false
  const peerIp = String(getRequestIP(event, { xForwardedFor: false }) || '')
  return trustedIps.includes(peerIp)
}

export default defineEventHandler((event) => {
  const method = String(event.node.req.method || 'GET').toUpperCase()
  const url = getRequestURL(event)
  const accept = String(getHeader(event, 'accept') || '')

  if (!shouldTrackRequest(url.pathname, accept, method)) {
    return
  }

  const startedAt = Date.now()
  const userAgent = String(getHeader(event, 'user-agent') || '')
  const referer = String(getHeader(event, 'referer') || '')
  const acceptLanguage = String(getHeader(event, 'accept-language') || '')
  const ip = String(getRequestIP(event, { xForwardedFor: shouldTrustProxy(event) }) || 'unknown')

  event.node.res.once('finish', () => {
    const { visitLogs } = getCollections(getDb())

    void visitLogs
      .insertOne({
        requestId: randomUUID(),
        path: url.pathname,
        fullPath: `${url.pathname}${url.search || ''}`,
        method,
        statusCode: Number(event.node.res.statusCode || 200),
        ip,
        userAgent,
        referer,
        acceptLanguage,
        browser: parseBrowser(userAgent),
        os: parseOS(userAgent),
        deviceType: parseDeviceType(userAgent),
        durationMs: Math.max(0, Date.now() - startedAt),
        visitedAt: new Date()
      })
      .catch((error: any) => {
        console.error('visit log insert failed:', error?.message || error)
      })
  })
})
