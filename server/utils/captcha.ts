import { create } from 'svg-captcha'
import { sha256Hex, randomTokenHex } from './crypto-safe'
import { getEphemeralStore } from './ephemeral-store'

const CAPTCHA_TTL_SECONDS = Number(process.env.CAPTCHA_TTL_SECONDS) || 300

export function normalizeCaptchaText(text: string): string {
  return String(text || '').toLowerCase().replace(/\s+/g, '')
}

function captchaKey(captchaId: string): string {
  return `captcha:${captchaId}`
}

/** 生成验证码，答案以 sha256 存 store（一次性）；SECURITY_TEST_HOOK=1 时返回 debugAnswer（生产关闭） */
export async function issueCaptcha() {
  const captcha = create({
    size: 4,
    ignoreChars: '0oO1ilI',
    noise: 2,
    color: true,
  })

  const captchaId = randomTokenHex(16)
  const answerHash = sha256Hex(normalizeCaptchaText(captcha.text))
  const store = getEphemeralStore()
  await store.set(captchaKey(captchaId), answerHash, CAPTCHA_TTL_SECONDS)

  const debugAnswer = process.env.SECURITY_TEST_HOOK === '1' ? captcha.text : undefined
  return {
    captchaId,
    image: captcha.data,
    ...(debugAnswer ? { debugAnswer } : {}),
  }
}

/** 校验并消费验证码（一次性，校验后即删除） */
export async function consumeCaptcha(captchaId: string, code: string): Promise<boolean> {
  if (!captchaId || !code) return false
  const store = getEphemeralStore()
  const key = captchaKey(captchaId)
  const storedHash = await store.get(key)
  if (!storedHash) return false
  await store.del(key)
  return sha256Hex(normalizeCaptchaText(code)) === storedHash
}
