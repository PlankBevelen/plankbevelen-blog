/** 校验外链 URL 仅允许 http/https，拒绝 javascript:/data:/file: 等危险协议 */
export function isSafeHttpUrl(value: string): boolean {
  if (!value) return false
  try {
    const u = new URL(String(value))
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
