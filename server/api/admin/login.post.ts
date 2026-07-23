import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { sha256 } from 'js-sha256'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

export default defineEventHandler(async (event) => {
  const body = await readBody<{ account: string; password: string; remember?: boolean }>(event)
  const { account, password, remember } = body || { account: '', password: '', remember: false }

  const config = useRuntimeConfig()
  const adminAccount = process.env.NUXT_ADMIN_ACCOUNT 
  const secret = config.authSecret as string
  const adminPassword = process.env.NUXT_ADMIN_PASSWORD 
  if (!adminAccount || !secret || !adminPassword) {
    setResponseStatus(event, 500)
    return { code: 'MISSING_CONFIG', message: 'Admin credentials not configured' }
  }

  if (!account || !password) {
    setResponseStatus(event, 400)
    return { code: 'BAD_REQUEST', message: 'Missing account or password' }
  }
  
  // 对前端传来的明文密码进行哈希，然后与配置的密码哈希进行比对
  const inputHash = sha256(String(password))
  const hash = sha256(String(adminPassword))
  
  if (account !== adminAccount || inputHash !== hash) {
    setResponseStatus(event, 401)
    return { code: 'INVALID_CREDENTIALS', message: 'Invalid account or password' }
  }

  const rawExpires = remember
    ? config.public.expirationTime
    : config.public.keepAliveTime
  const expiresIn = Number(rawExpires)
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    setResponseStatus(event, 500)
    return { code: 'INVALID_CONFIG', message: 'Invalid token expiration configuration' }
  }
  const token = jwt.sign({ sub: adminAccount }, secret, { expiresIn })

  // Token 由客户端可读 cookie 保存并经请求头 token 传给 API，此处不再写 httpOnly 同名 cookie
  setResponseStatus(event, 200)
  return { message: 'Login successful', status: 200, token }
})
