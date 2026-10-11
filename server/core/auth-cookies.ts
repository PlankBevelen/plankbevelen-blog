import { getCookie, setCookie, deleteCookie } from 'h3'
import type { H3Event } from 'h3'
import { getRuntimeSettingsSync, resolveCookieSecure } from './runtime-settings'

/**
 * 认证 Cookie 统一管理：JWT 走 httpOnly，CSRF token 走可读 cookie（双提交用）。
 */

function cookiePrefix(): string {
  return getRuntimeSettingsSync().cookiePrefix || 'plankbevelen_'
}

function cookieSecure(): boolean {
  return resolveCookieSecure(getRuntimeSettingsSync())
}

export function accessTokenCookieName(): string {
  return `${cookiePrefix()}access_token`
}

export function csrfCookieName(): string {
  return `${cookiePrefix()}csrf`
}

export function sessionMaxAgeSeconds(remember: boolean): number {
  const settings = getRuntimeSettingsSync()
  const raw = remember ? settings.sessionExpirationSeconds : settings.sessionKeepAliveSeconds
  const seconds = Number(raw)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 60 * 60 * 24 * 7
}

export function setAuthCookies(event: H3Event, token: string, csrf: string, remember: boolean): void {
  const maxAge = sessionMaxAgeSeconds(remember)
  const secure = cookieSecure()

  setCookie(event, accessTokenCookieName(), token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  })

  setCookie(event, csrfCookieName(), csrf, {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

export function clearAuthCookies(event: H3Event): void {
  const secure = cookieSecure()
  const opts = { path: '/', secure, sameSite: 'lax' as const }
  deleteCookie(event, accessTokenCookieName(), opts)
  deleteCookie(event, csrfCookieName(), opts)
}

export function readAccessToken(event: H3Event): string {
  return getCookie(event, accessTokenCookieName()) || ''
}

export function readCsrfCookie(event: H3Event): string {
  return getCookie(event, csrfCookieName()) || ''
}
