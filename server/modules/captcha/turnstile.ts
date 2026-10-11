import { getRuntimeSettings } from '../../core/runtime-settings'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/** 向 Cloudflare 校验 Turnstile token（一次性） */
export async function verifyTurnstileToken(token: string, remoteip?: string): Promise<boolean> {
  const value = String(token || '').trim()
  if (!value) return false

  const settings = await getRuntimeSettings()
  const secret = settings.turnstileSecretKey
  if (!secret) {
    console.error('Turnstile secret 未配置')
    return false
  }

  try {
    const body = new URLSearchParams()
    body.set('secret', secret)
    body.set('response', value)
    if (remoteip && remoteip !== 'unknown') body.set('remoteip', remoteip)

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(8000),
    })
    const data: any = await res.json().catch(() => null)
    return Boolean(data?.success)
  } catch (error: any) {
    console.error('Turnstile 校验失败:', error?.message || error)
    return false
  }
}
