import { defineEventHandler, setResponseStatus } from 'h3'
import jwt from 'jsonwebtoken'
import { readAccessToken } from '../../utils/auth-cookies'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const secret = config.authSecret as string
  if (!secret) {
    setResponseStatus(event, 500)
    return { status: 500, authenticated: false }
  }

  const token = readAccessToken(event)
  if (!token) {
    return { status: 200, authenticated: false }
  }

  try {
    jwt.verify(token, secret)
    return { status: 200, authenticated: true }
  } catch {
    return { status: 200, authenticated: false }
  }
})
