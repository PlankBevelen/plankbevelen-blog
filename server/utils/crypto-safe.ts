import { createHash, timingSafeEqual, randomBytes } from 'node:crypto'

/** SHA-256 hex 摘要（用于密码/验证码等不可逆存储） */
export function sha256Hex(value: string): string {
  return createHash('sha256').update(String(value)).digest('hex')
}

/** 常量时间字符串比对（长度不等直接 false，避免时序泄露） */
export function safeEqualString(a: string, b: string): boolean {
  const ab = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/** 随机 hex token（默认 32 字节 = 64 位 hex） */
export function randomTokenHex(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}
