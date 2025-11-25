import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { sha256 } from 'js-sha256'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; password: string; remember?: boolean }>(event)
  const { username, password, remember } = body || { username: '', password: '', remember: false }

  const config = useRuntimeConfig() as any
  const account = config.adminAccount as string | undefined
  const secret = (config.authSecret as string) || 'dev-secret'
  const pass = config.adminPassword as string || ''
  const hash = sha256(pass)

  if (!account || !hash) {
    setResponseStatus(event, 500)
    return { code: 'MISSING_CONFIG', message: 'Admin credentials not configured' }
  }

  if (username !== account || password !== hash) {
    setResponseStatus(event, 401)
    return { code: 'INVALID_CREDENTIALS', message: 'Invalid account or password' }
  }

  const expiresIn = remember ? Number(config.public.expirationTime) : Number(config.public.keepAliveTime)
  const token = jwt.sign({ sub: username }, secret, { expiresIn })

  const opts: any = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  }
  if (remember) {
    opts.maxAge = expiresIn
  }
  setResponseStatus(event, 200)
  return { message: 'Login successful', status: 200, token }
})
