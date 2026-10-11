import { defineEventHandler, setResponseStatus } from 'h3'
import { issueCaptcha } from '../../utils/captcha'
import { assertRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const max = Number(process.env.CAPTCHA_RATE_LIMIT_MAX) || 20
  const windowSec = Number(process.env.CAPTCHA_RATE_LIMIT_WINDOW_SECONDS) || 60
  if (!(await assertRateLimit(event, 'captcha', max, windowSec))) {
    return { status: 429, msg: '请求过于频繁，请稍后再试' }
  }

  try {
    const data = await issueCaptcha()
    return { status: 200, ...data }
  } catch (error) {
    console.error('验证码生成失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误' }
  }
})
