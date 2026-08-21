import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import jwt from 'jsonwebtoken'
import { sha256Hex, safeEqualString, randomTokenHex } from '../../utils/crypto-safe'
import { consumeCaptcha } from '../../utils/captcha'
import { assertRateLimit } from '../../utils/rate-limit'
import { setAuthCookies, sessionMaxAgeSeconds } from '../../utils/auth-cookies'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    account: string
    password: string
    remember?: boolean
    captchaId?: string
    captchaCode?: string
  }>(event)
  const {
    account = '',
    password = '',
    remember = false,
    captchaId = '',
    captchaCode = '',
  } = body || {}

  // 1. 登录限流
  const rateMax = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10
  const rateWindow = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_SECONDS) || 60
  if (!(await assertRateLimit(event, 'login', rateMax, rateWindow))) {
    return { status: 429, msg: '登录尝试过于频繁，请稍后再试' }
  }

  // 2. 验证码（一次性）
  if (!(await consumeCaptcha(captchaId, captchaCode))) {
    setResponseStatus(event, 400)
    return { status: 400, msg: '验证码错误或已过期' }
  }

  // 3. 缺配置 → 500
  const config = useRuntimeConfig()
  const adminAccount = process.env.NUXT_ADMIN_ACCOUNT
  const adminPasswordHash = process.env.NUXT_ADMIN_PASSWORD
  const secret = config.authSecret as string
  if (!adminAccount || !adminPasswordHash || !secret) {
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器未正确配置管理员凭据' }
  }

  // 4. 参数
  if (!account || !password) {
    setResponseStatus(event, 400)
    return { status: 400, msg: '请输入账号和密码' }
  }

  // 5. 常量时间比对（账号 + 密码哈希）
  const accountOk = safeEqualString(account, adminAccount)
  const passwordOk = safeEqualString(sha256Hex(password), adminPasswordHash)
  if (!accountOk || !passwordOk) {
    setResponseStatus(event, 401)
    return { status: 401, msg: '账号或密码错误' }
  }

  // 6. 签发 JWT + 设置 httpOnly Cookie（响应不返回 token）
  const expiresIn = sessionMaxAgeSeconds(remember)
  const token = jwt.sign({ sub: adminAccount }, secret, { expiresIn })
  const csrf = randomTokenHex(16)
  setAuthCookies(event, token, csrf, remember)

  setResponseStatus(event, 200)
  return { status: 200, msg: '登录成功' }
})
