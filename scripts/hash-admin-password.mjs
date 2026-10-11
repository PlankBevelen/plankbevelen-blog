// 生成管理员密码的 Argon2 哈希，写入 .env 的 NUXT_ADMIN_PASSWORD
// 用法: node scripts/hash-admin-password.mjs "your-password"

import { hash } from '@node-rs/argon2'

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/hash-admin-password.mjs "<password>"')
  process.exit(1)
}

const value = await hash(password)
console.log(value)
