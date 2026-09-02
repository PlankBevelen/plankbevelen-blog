import { setHeader, setResponseStatus, getRequestIP } from 'h3'
import type { H3Event } from 'h3'
import { getEphemeralStore } from './ephemeral-store'

/**
 * 业务级限流（登录 / 验证码等）。
 * 超限时写入 429 + Retry-After 并返回 false，调用方据此返回错误体。
 */
export async function assertRateLimit(
  event: H3Event,
  bucket: string,
  max: number,
  windowSec: number
): Promise<boolean> {
  if (!Number.isFinite(max) || max <= 0) return true

  const ip = getRequestIP(event, { xForwardedFor: false }) || 'unknown'
  const store = getEphemeralStore()
  const key = `rl:${bucket}:${ip}`
  const count = await store.incr(key, windowSec)

  if (count > max) {
    setHeader(event, 'Retry-After', String(windowSec))
    setResponseStatus(event, 429)
    return false
  }
  return true
}
