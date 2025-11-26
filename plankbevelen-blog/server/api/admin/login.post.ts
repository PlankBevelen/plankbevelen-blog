import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { sha256 } from 'js-sha256'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

export default defineEventHandler(async (event) => {
  const body = await readBody<{ account: string; password: string; remember?: boolean }>(event)
  const { account, password, remember } = body || { account: '', password: '', remember: false }

  const adminAccount = process.env.NUXT_ADMIN_ACCOUNT 
  const secret = process.env.NUXT_AUTH_SECRET 
  const adminPassword = process.env.NUXT_ADMIN_PASSWORD 
  const hash = sha256(adminPassword)

  if (!account || !adminAccount || !hash) {
    setResponseStatus(event, 500)
    return { code: 'MISSING_CONFIG', message: 'Admin credentials not configured' }
  }
  console.log('Login request:', { adminAccount, secret, adminPassword })
  if (account !== adminAccount || password !== hash) {
    setResponseStatus(event, 401)
    return { code: 'INVALID_CREDENTIALS', message: 'Invalid account or password' }
  }
  const expiresIn = remember ? Number(process.env.NUXT_EXPIRATION_TIME) : Number(process.env.NUXT_KEEP_ALIVE_TIME)
  const token = jwt.sign({ sub: adminAccount }, secret, { expiresIn })

  const opts: any = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  }
  if (remember) {
    opts.maxAge = expiresIn
  }
  console.log('Setting cookie with token:', token)
  setCookie(event, token, opts)
  setResponseStatus(event, 200)
  return { message: 'Login successful', status: 200, token }
})
