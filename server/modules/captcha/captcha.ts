import sharp from 'sharp'
import { randomInt } from 'node:crypto'
import { randomTokenHex } from '../../core/crypto-safe'
import { getEphemeralStore } from '../../core/ephemeral-store'
import { getRuntimeSettings } from '../../core/runtime-settings'

const WIDTH = 280
const HEIGHT = 140
const PIECE = 42

function captchaKey(captchaId: string): string {
  return `captcha:${captchaId}`
}

function allowCaptchaDebug(): boolean {
  return process.env.SECURITY_TEST_HOOK === '1' && process.env.NODE_ENV !== 'production'
}

function buildBackgroundSvg(): Buffer {
  const h1 = randomInt(0, 360)
  const h2 = (h1 + randomInt(40, 120)) % 360
  const blobs = Array.from({ length: 8 }, () => {
    const cx = randomInt(0, WIDTH)
    const cy = randomInt(0, HEIGHT)
    const r = randomInt(18, 55)
    const hue = randomInt(0, 360)
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsla(${hue},55%,62%,0.55)"/>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${h1},48%,72%)"/>
        <stop offset="100%" stop-color="hsl(${h2},52%,58%)"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    ${blobs}
    <g stroke="rgba(255,255,255,0.25)" stroke-width="1" fill="none">
      <path d="M0 ${randomInt(20, 60)} Q ${WIDTH / 2} ${randomInt(0, HEIGHT)} ${WIDTH} ${randomInt(80, 120)}"/>
      <path d="M0 ${randomInt(70, 120)} Q ${WIDTH / 2} ${randomInt(0, HEIGHT)} ${WIDTH} ${randomInt(20, 70)}"/>
    </g>
  </svg>`
  return Buffer.from(svg)
}

/** 生成滑动拼图验证码；答案为缺口 X 坐标（一次性）；仅非生产且 SECURITY_TEST_HOOK=1 时返回 debugAnswer */
export async function issueCaptcha() {
  const settings = await getRuntimeSettings()
  const bgBuf = await sharp(buildBackgroundSvg()).png().toBuffer()
  const x = randomInt(PIECE + 12, WIDTH - PIECE - 12)
  const y = randomInt(10, HEIGHT - PIECE - 10)

  const pieceBuf = await sharp(bgBuf)
    .extract({ left: x, top: y, width: PIECE, height: PIECE })
    .png()
    .toBuffer()

  const holeSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <rect x="${x}" y="${y}" width="${PIECE}" height="${PIECE}" rx="4" ry="4" fill="rgba(0,0,0,0.42)"/>
    <rect x="${x}" y="${y}" width="${PIECE}" height="${PIECE}" rx="4" ry="4" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
  </svg>`)
  const holeOverlay = await sharp(holeSvg).png().toBuffer()
  const bgWithHole = await sharp(bgBuf)
    .composite([{ input: holeOverlay, top: 0, left: 0 }])
    .png()
    .toBuffer()

  const captchaId = randomTokenHex(16)
  const store = getEphemeralStore()
  await store.set(captchaKey(captchaId), String(x), settings.captchaTtlSeconds)

  const bgImage = `data:image/png;base64,${bgWithHole.toString('base64')}`
  const pieceImage = `data:image/png;base64,${pieceBuf.toString('base64')}`
  const debugAnswer = allowCaptchaDebug() ? String(x) : undefined

  return {
    captchaId,
    type: 'slide' as const,
    bgImage,
    pieceImage,
    pieceY: y,
    pieceSize: PIECE,
    width: WIDTH,
    height: HEIGHT,
    /** 兼容旧字段：安全测试与旧客户端可读 */
    image: bgImage,
    ...(debugAnswer ? { debugAnswer } : {}),
  }
}

/** 校验并消费滑动位置（一次性，允许像素容差） */
export async function consumeCaptcha(captchaId: string, code: string): Promise<boolean> {
  if (!captchaId || code === undefined || code === null || code === '') return false
  const store = getEphemeralStore()
  const key = captchaKey(captchaId)
  const stored = await store.get(key)
  if (stored === null || stored === undefined || stored === '') return false
  await store.del(key)

  const settings = await getRuntimeSettings()
  const expected = Number(stored)
  const actual = Number(code)
  if (!Number.isFinite(expected) || !Number.isFinite(actual)) return false
  return Math.abs(expected - actual) <= settings.captchaSlideTolerance
}
