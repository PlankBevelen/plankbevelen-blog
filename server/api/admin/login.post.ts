import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import jwt from 'jsonwebtoken'
import { safeEqualString, randomTokenHex } from '../../core/crypto-safe'
import { verifyAdminPassword } from '../../core/password'
import { verifyTurnstileToken } from '../../modules/captcha/turnstile'
import { assertRateLimit } from '../../core/rate-limit'
import { setAuthCookies, sessionMaxAgeSeconds } from '../../core/auth-cookies'
import { getRuntimeSettings } from '../../core/runtime-settings'
import { getClientIp } from '../../core/proxy-trust'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    account: string
    password: string
    remember?: boolean
    captchaCode?: string
    turnstileToken?: string
  }>(event)
  const {
    account = '',
    password = '',
    remember = false,
    captchaCode = '',
    turnstileToken = '',
  } = body || {}

  const settings = await getRuntimeSettings()

  if (!(await assertRateLimit(event, 'login', settings.loginRateLimitMax, settings.loginRateLimitWindowSeconds))) {
    return { status: 429, msg: '登录尝试过于频繁，请稍后再试' }
  }

  const captchaToken = String(turnstileToken || captchaCode || '').trim()
  if (!(await verifyTurnstileToken(captchaToken, getClientIp(event)))) {
    setResponseStatus(event, 400)
    return { status: 400, msg: '人机验证失败，请重试' }
  }

  const adminAccount = settings.adminAccount
  const adminPasswordHash = settings.adminPasswordHash
  const secret = settings.authSecret
  if (!adminAccount || !adminPasswordHash || !secret) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器未正确配置管理员凭据' }
  }

  if (!account || !password) {
    setResponseStatus(event, 400)
    return { status: 400, msg: '请输入账号和密码' }
  }

  const accountOk = safeEqualString(account, adminAccount)
  const passwordOk = await verifyAdminPassword(password, adminPasswordHash)
  if (!accountOk || !passwordOk) {
    setResponseStatus(event, 401)
    return { status: 401, msg: '账号或密码错误' }
  }

  const expiresIn = sessionMaxAgeSeconds(remember)
  const accessToken = jwt.sign({ sub: adminAccount }, secret, { expiresIn })
  const csrf = randomTokenHex(16)
  setAuthCookies(event, accessToken, csrf, remember)

  setResponseStatus(event, 200)
  return { status: 200, msg: '登录成功' }
})
