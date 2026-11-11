import { randomUUID } from 'node:crypto'
import { defineEventHandler, getCookie, getHeader, getRequestIP, readBody, setCookie } from 'h3'
import { getCollections, getDb } from '../utils/mongo'

const VISITOR_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function parseDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase()
  if (!ua) return 'unknown' as const
  if (/(bot|spider|crawler|slurp|bingpreview)/i.test(ua)) return 'bot' as const
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) return 'tablet' as const
  if (/(mobile|iphone|ipod|android|blackberry|iemobile|opera mini)/i.test(ua)) return 'mobile' as const
  return 'desktop' as const
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

function shouldTrustProxy(event: any): boolean {
  if (process.env.TRUST_PROXY === '1') return true
  const trustedIps = String(process.env.TRUSTED_PROXY_IPS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (!trustedIps.length) return false
  const peerIp = String(getRequestIP(event, { xForwardedFor: false }) || '')
  return trustedIps.includes(peerIp)
}

function visitorCookieName() {
  const prefix = (useRuntimeConfig().public.cookiePrefix as string) || 'plankbevelen_'
  return `${prefix}vid`
}

function pagePath(input: unknown) {
  const raw = String(input || '')
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\') || raw.length > 512) return ''
  if (raw.startsWith('/admin') || raw.startsWith('/api')) return ''
  return raw
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const fullPath = pagePath(body?.path)
  if (!fullPath) return { ok: false }

  const userAgent = String(getHeader(event, 'user-agent') || '')
  const name = visitorCookieName()
  const existing = String(getCookie(event, name) || '')
  const visitorId = VISITOR_ID_RE.test(existing) ? existing : randomUUID()
  if (visitorId !== existing) {
    setCookie(event, name, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== '0',
      sameSite: 'lax',
      path: '/',
      maxAge: VISITOR_COOKIE_MAX_AGE,
    })
  }

  const path = fullPath.split('?')[0] || '/'
  const { visitLogs } = getCollections(getDb())
  void visitLogs.insertOne({
    requestId: randomUUID(),
    path,
    fullPath,
    method: 'GET',
    statusCode: 200,
    ip: String(getRequestIP(event, { xForwardedFor: shouldTrustProxy(event) }) || 'unknown'),
    visitorId,
    userAgent,
    referer: String(getHeader(event, 'referer') || ''),
    acceptLanguage: String(getHeader(event, 'accept-language') || ''),
    browser: parseBrowser(userAgent),
    os: parseOS(userAgent),
    deviceType: parseDeviceType(userAgent),
    durationMs: 0,
    visitedAt: new Date(),
  }).catch((error: any) => {
    console.error('visit log insert failed:', error?.message || error)
  })

  return { ok: true }
})
