import { defineEventHandler, setResponseStatus, getHeader } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = (getHeader(event, 'token') as string | undefined) || ''
  if (!token) {
    setResponseStatus(event, 401)
    return { code: 'UNAUTHORIZED' }
  }
  const secret = (useRuntimeConfig().authSecret as string) || 'dev-secret'
  try {
    const payload = jwt.verify(token, secret) as any
    setResponseStatus(event, 200)
    return { status: 200, message: 'Already logged in', username: payload.sub }
  } catch (e: any) {
    setResponseStatus(event, 401)
    return { code: 'INVALID_TOKEN' }
  }
})
