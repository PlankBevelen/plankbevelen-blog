const SESSION_FALLBACK_SECONDS = 60 * 60 * 24 * 7

/** remember 用过期时间，否则用保活时间。非法或非正数回落到 7 天。 */
export function resolveSessionMaxAge(remember: boolean, expirationSeconds: unknown, keepAliveSeconds: unknown): number {
  const raw = remember ? expirationSeconds : keepAliveSeconds
  const seconds = Number(raw)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : SESSION_FALLBACK_SECONDS
}
