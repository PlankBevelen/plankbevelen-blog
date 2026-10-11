import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2'
import { sha256Hex, safeEqualString } from './crypto-safe'

const ARGON2_PREFIX = '$argon2'

/** 生成 Argon2id 密码哈希（写入配置中心 adminPasswordHash / 空库种子 NUXT_ADMIN_PASSWORD） */
export async function hashAdminPassword(password: string): Promise<string> {
  return argon2Hash(String(password || ''))
}

/**
 * 校验管理员密码。
 * - 存库/环境变量以 `$argon2` 开头 → Argon2
 * - 否则按历史 SHA-256 hex 比对（迁移兼容）
 */
export async function verifyAdminPassword(password: string, stored: string): Promise<boolean> {
  const value = String(stored || '')
  if (!value) return false
  if (value.startsWith(ARGON2_PREFIX)) {
    try {
      return await argon2Verify(value, String(password || ''))
    } catch {
      return false
    }
  }
  return safeEqualString(sha256Hex(password), value)
}
