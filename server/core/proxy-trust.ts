import { getRequestIP } from 'h3'
import type { H3Event } from 'h3'
import { getRuntimeSettingsSync } from './runtime-settings'

/** 是否信任 X-Forwarded-For（配置中心 trustProxy / trustedProxyIps） */
export function shouldTrustProxy(event: H3Event): boolean {
  const settings = getRuntimeSettingsSync()
  if (settings.trustProxy) return true
  const trustedIps = String(settings.trustedProxyIps || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!trustedIps.length) return false
  const peerIp = String(getRequestIP(event, { xForwardedFor: false }) || '')
  return trustedIps.includes(peerIp)
}

export function getClientIp(event: H3Event): string {
  return String(getRequestIP(event, { xForwardedFor: shouldTrustProxy(event) }) || 'unknown')
}
