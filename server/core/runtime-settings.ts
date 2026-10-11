import { getCollections, getDb } from './mongo'
import { hashAdminPassword } from './password'

export type CookieSecureMode = 'auto' | 'force_on' | 'force_off'

/** 系统运行时配置（存 Mongo site_configs，后台可改） */
export type RuntimeSettings = {
  adminAccount: string
  adminPasswordHash: string
  authSecret: string
  sessionExpirationSeconds: number
  sessionKeepAliveSeconds: number
  cookiePrefix: string
  cookieSecure: CookieSecureMode
  trustProxy: boolean
  trustedProxyIps: string
  loginRateLimitMax: number
  loginRateLimitWindowSeconds: number
  captchaRateLimitMax: number
  captchaRateLimitWindowSeconds: number
  captchaTtlSeconds: number
  captchaSlideTolerance: number
  friendLinkSubmitRateLimitMax: number
  friendLinkSubmitRateLimitWindowSeconds: number
  friendLinkApplyEnabled: boolean
  uploadMaxBytes: number
  uploadDir: string
  tempUploadTtlHours: number
  tempCleanIntervalMinutes: number
  baseUrl: string
  agentChatUrl: string
  agentHealthUrl: string
  visitLogTtlDays: number
  turnstileSiteKey: string
  turnstileSecretKey: string
}

export type RuntimeSettingsPublic = {
  cookiePrefix: string
  sessionExpirationSeconds: number
  sessionKeepAliveSeconds: number
  agentChatUrl: string
  agentHealthUrl: string
  friendLinkApplyEnabled: boolean
  baseUrl: string
  turnstileSiteKey: string
}

/** 管理端 GET 视图（不含密码哈希 / secret 明文） */
export type RuntimeSettingsAdminView = Omit<
  RuntimeSettings,
  'adminPasswordHash' | 'authSecret' | 'turnstileSecretKey'
> & {
  hasAdminPassword: boolean
  authSecretConfigured: boolean
  authSecretMasked: string
  turnstileSecretConfigured: boolean
  redisConfigured: boolean
  nodeEnv: string
}

const DOC_ID = 'runtime-settings'
const CACHE_TTL_MS = 30_000

let cache: RuntimeSettings | null = null
let cacheAt = 0

function envNum(name: string, fallback: number): number {
  const n = Number(process.env[name])
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function envStr(name: string, fallback: string): string {
  const v = process.env[name]
  return v !== undefined && v !== null && String(v).trim() !== '' ? String(v).trim() : fallback
}

/** 代码 + .env 缺省（空库种子与极端回退） */
export function buildDefaultRuntimeSettings(): RuntimeSettings {
  const cookieSecureEnv = process.env.COOKIE_SECURE
  let cookieSecure: CookieSecureMode = 'auto'
  if (cookieSecureEnv === '0') cookieSecure = 'force_off'
  else if (cookieSecureEnv === '1') cookieSecure = 'force_on'

  return {
    adminAccount: envStr('NUXT_ADMIN_ACCOUNT', ''),
    adminPasswordHash: envStr('NUXT_ADMIN_PASSWORD', ''),
    authSecret: envStr('NUXT_AUTH_SECRET', ''),
    sessionExpirationSeconds: envNum('NUXT_EXPIRATION_TIME', 43200),
    sessionKeepAliveSeconds: envNum('NUXT_KEEP_ALIVE_TIME', 604800),
    cookiePrefix: envStr('NUXT_PUBLIC_COOKIE_PREFIX', 'plankbevelen_'),
    cookieSecure,
    trustProxy: process.env.TRUST_PROXY === '1',
    trustedProxyIps: envStr('TRUSTED_PROXY_IPS', ''),
    loginRateLimitMax: envNum('LOGIN_RATE_LIMIT_MAX', 10),
    loginRateLimitWindowSeconds: envNum('LOGIN_RATE_LIMIT_WINDOW_SECONDS', 60),
    captchaRateLimitMax: envNum('CAPTCHA_RATE_LIMIT_MAX', 20),
    captchaRateLimitWindowSeconds: envNum('CAPTCHA_RATE_LIMIT_WINDOW_SECONDS', 60),
    captchaTtlSeconds: envNum('CAPTCHA_TTL_SECONDS', 300),
    captchaSlideTolerance: envNum('CAPTCHA_SLIDE_TOLERANCE', 5),
    friendLinkSubmitRateLimitMax: envNum('FRIEND_LINK_SUBMIT_RATE_LIMIT_MAX', 3),
    friendLinkSubmitRateLimitWindowSeconds: envNum('FRIEND_LINK_SUBMIT_RATE_LIMIT_WINDOW_SECONDS', 3600),
    friendLinkApplyEnabled: process.env.FRIEND_LINK_APPLY_ENABLED !== '0',
    uploadMaxBytes: envNum('UPLOAD_MAX_BYTES', 5242880),
    uploadDir: envStr('UPLOAD_DIR', ''),
    tempUploadTtlHours: envNum('TEMP_UPLOAD_TTL_HOURS', 48),
    tempCleanIntervalMinutes: envNum('TEMP_CLEAN_INTERVAL_MINUTES', 60),
    baseUrl: envStr('NUXT_BASE_URL', '/'),
    agentChatUrl: envStr('NUXT_PUBLIC_AGENT_CHAT_URL', 'http://127.0.0.1:6543/chat'),
    agentHealthUrl: envStr('NUXT_PUBLIC_AGENT_HEALTH_URL', 'http://127.0.0.1:6543/health'),
    visitLogTtlDays: envNum('VISIT_LOG_TTL_DAYS', 180),
    turnstileSiteKey: envStr('NUXT_TURNSTILE_SITE_KEY', ''),
    turnstileSecretKey: envStr('NUXT_TURNSTILE_SECRET_KEY', ''),
  }
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

function mergeSettings(raw: Partial<RuntimeSettings> | null | undefined): RuntimeSettings {
  const base = buildDefaultRuntimeSettings()
  if (!raw || typeof raw !== 'object') return base
  return {
    ...base,
    ...raw,
    loginRateLimitMax: clampInt(raw.loginRateLimitMax ?? base.loginRateLimitMax, 1, 1000, base.loginRateLimitMax),
    loginRateLimitWindowSeconds: clampInt(raw.loginRateLimitWindowSeconds ?? base.loginRateLimitWindowSeconds, 1, 86400, base.loginRateLimitWindowSeconds),
    captchaRateLimitMax: clampInt(raw.captchaRateLimitMax ?? base.captchaRateLimitMax, 1, 1000, base.captchaRateLimitMax),
    captchaRateLimitWindowSeconds: clampInt(raw.captchaRateLimitWindowSeconds ?? base.captchaRateLimitWindowSeconds, 1, 86400, base.captchaRateLimitWindowSeconds),
    captchaTtlSeconds: clampInt(raw.captchaTtlSeconds ?? base.captchaTtlSeconds, 30, 3600, base.captchaTtlSeconds),
    captchaSlideTolerance: clampInt(raw.captchaSlideTolerance ?? base.captchaSlideTolerance, 1, 30, base.captchaSlideTolerance),
    friendLinkSubmitRateLimitMax: clampInt(raw.friendLinkSubmitRateLimitMax ?? base.friendLinkSubmitRateLimitMax, 1, 100, base.friendLinkSubmitRateLimitMax),
    friendLinkSubmitRateLimitWindowSeconds: clampInt(raw.friendLinkSubmitRateLimitWindowSeconds ?? base.friendLinkSubmitRateLimitWindowSeconds, 60, 604800, base.friendLinkSubmitRateLimitWindowSeconds),
    sessionExpirationSeconds: clampInt(raw.sessionExpirationSeconds ?? base.sessionExpirationSeconds, 300, 2592000, base.sessionExpirationSeconds),
    sessionKeepAliveSeconds: clampInt(raw.sessionKeepAliveSeconds ?? base.sessionKeepAliveSeconds, 300, 2592000, base.sessionKeepAliveSeconds),
    uploadMaxBytes: clampInt(raw.uploadMaxBytes ?? base.uploadMaxBytes, 1024, 50 * 1024 * 1024, base.uploadMaxBytes),
    tempUploadTtlHours: clampInt(raw.tempUploadTtlHours ?? base.tempUploadTtlHours, 1, 720, base.tempUploadTtlHours),
    tempCleanIntervalMinutes: clampInt(raw.tempCleanIntervalMinutes ?? base.tempCleanIntervalMinutes, 5, 1440, base.tempCleanIntervalMinutes),
    visitLogTtlDays: clampInt(raw.visitLogTtlDays ?? base.visitLogTtlDays, 1, 3650, base.visitLogTtlDays),
    friendLinkApplyEnabled: raw.friendLinkApplyEnabled !== undefined ? Boolean(raw.friendLinkApplyEnabled) : base.friendLinkApplyEnabled,
    trustProxy: raw.trustProxy !== undefined ? Boolean(raw.trustProxy) : base.trustProxy,
    cookieSecure: (['auto', 'force_on', 'force_off'] as const).includes(raw.cookieSecure as CookieSecureMode)
      ? (raw.cookieSecure as CookieSecureMode)
      : base.cookieSecure,
    // 库内空字符串时回退 .env / 默认值，避免盖住已配置的 Turnstile
    turnstileSiteKey: String(raw.turnstileSiteKey || base.turnstileSiteKey || ''),
    turnstileSecretKey: String(raw.turnstileSecretKey || base.turnstileSecretKey || ''),
  }
}

function setCache(settings: RuntimeSettings) {
  cache = settings
  cacheAt = Date.now()
}

export function invalidateRuntimeSettingsCache() {
  cache = null
  cacheAt = 0
}

/** 同步读取（缓存或默认），供 cookie 名等热路径 */
export function getRuntimeSettingsSync(): RuntimeSettings {
  if (cache) return cache
  return buildDefaultRuntimeSettings()
}

async function readFromDb(): Promise<RuntimeSettings | null> {
  try {
    const { siteConfigs } = getCollections(getDb())
    const doc = await siteConfigs.findOne({ _id: DOC_ID })
    if (!doc?.data) return null
    return mergeSettings(doc.data as Partial<RuntimeSettings>)
  } catch {
    return null
  }
}

async function writeToDb(settings: RuntimeSettings): Promise<void> {
  const { siteConfigs } = getCollections(getDb())
  await siteConfigs.updateOne(
    { _id: DOC_ID },
    {
      $set: {
        type: DOC_ID,
        data: settings,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        _id: DOC_ID,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )
}

/** 空库时用 .env 种子写入；已存在则加载（Turnstile 等密钥可从 env 回填） */
export async function ensureRuntimeSettingsSeeded(): Promise<RuntimeSettings> {
  const existing = await readFromDb()
  if (existing) {
    const envSite = envStr('NUXT_TURNSTILE_SITE_KEY', '')
    const envSecret = envStr('NUXT_TURNSTILE_SECRET_KEY', '')
    let next = existing
    let dirty = false
    if (!existing.turnstileSiteKey && envSite) {
      next = { ...next, turnstileSiteKey: envSite }
      dirty = true
    }
    if (!existing.turnstileSecretKey && envSecret) {
      next = { ...next, turnstileSecretKey: envSecret }
      dirty = true
    }
    if (dirty) {
      try {
        await writeToDb(next)
      } catch (e: any) {
        console.error('runtime-settings turnstile backfill failed:', e?.message || e)
      }
    }
    setCache(next)
    return next
  }
  const seeded = buildDefaultRuntimeSettings()
  try {
    await writeToDb(seeded)
  } catch (e: any) {
    console.error('runtime-settings seed failed:', e?.message || e)
  }
  setCache(seeded)
  return seeded
}

export async function getRuntimeSettings(): Promise<RuntimeSettings> {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache
  // 统一走 seed/回填，避免库内空 Turnstile 字段挡住 .env
  return ensureRuntimeSettingsSeeded()
}

export function toPublicSettings(settings: RuntimeSettings): RuntimeSettingsPublic {
  return {
    cookiePrefix: settings.cookiePrefix,
    sessionExpirationSeconds: settings.sessionExpirationSeconds,
    sessionKeepAliveSeconds: settings.sessionKeepAliveSeconds,
    agentChatUrl: settings.agentChatUrl,
    agentHealthUrl: settings.agentHealthUrl,
    friendLinkApplyEnabled: settings.friendLinkApplyEnabled,
    baseUrl: settings.baseUrl,
    turnstileSiteKey: settings.turnstileSiteKey,
  }
}

export function toAdminView(settings: RuntimeSettings): RuntimeSettingsAdminView {
  const { adminPasswordHash, authSecret, turnstileSecretKey, ...rest } = settings
  const masked =
    authSecret.length <= 8
      ? authSecret
        ? '********'
        : ''
      : `${authSecret.slice(0, 4)}****${authSecret.slice(-4)}`
  return {
    ...rest,
    hasAdminPassword: Boolean(adminPasswordHash),
    authSecretConfigured: Boolean(authSecret),
    authSecretMasked: masked,
    turnstileSecretConfigured: Boolean(turnstileSecretKey),
    redisConfigured: Boolean(process.env.REDIS_URL),
    nodeEnv: process.env.NODE_ENV || 'unknown',
  }
}

export type RuntimeSettingsUpdateInput = Partial<{
  adminAccount: string
  newAdminPassword: string
  newAuthSecret: string
  sessionExpirationSeconds: number
  sessionKeepAliveSeconds: number
  cookiePrefix: string
  cookieSecure: CookieSecureMode
  trustProxy: boolean
  trustedProxyIps: string
  loginRateLimitMax: number
  loginRateLimitWindowSeconds: number
  captchaRateLimitMax: number
  captchaRateLimitWindowSeconds: number
  captchaTtlSeconds: number
  captchaSlideTolerance: number
  friendLinkSubmitRateLimitMax: number
  friendLinkSubmitRateLimitWindowSeconds: number
  friendLinkApplyEnabled: boolean
  uploadMaxBytes: number
  uploadDir: string
  tempUploadTtlHours: number
  tempCleanIntervalMinutes: number
  baseUrl: string
  agentChatUrl: string
  agentHealthUrl: string
  visitLogTtlDays: number
  turnstileSiteKey: string
  newTurnstileSecretKey: string
}>

export async function updateRuntimeSettings(
  input: RuntimeSettingsUpdateInput
): Promise<RuntimeSettings> {
  const current = await getRuntimeSettings()
  const next: RuntimeSettings = { ...current }

  if (input.adminAccount !== undefined) {
    const account = String(input.adminAccount || '').trim()
    if (!account || account.length > 64) throw new Error('INVALID_ADMIN_ACCOUNT')
    next.adminAccount = account
  }
  if (input.newAdminPassword) {
    const pwd = String(input.newAdminPassword)
    if (pwd.length < 8 || pwd.length > 128) throw new Error('INVALID_ADMIN_PASSWORD')
    next.adminPasswordHash = await hashAdminPassword(pwd)
  }
  if (input.newAuthSecret) {
    const secret = String(input.newAuthSecret).trim()
    if (secret.length < 16 || secret.length > 256) throw new Error('INVALID_AUTH_SECRET')
    next.authSecret = secret
  }
  if (input.newTurnstileSecretKey) {
    next.turnstileSecretKey = String(input.newTurnstileSecretKey).trim().slice(0, 256)
  }

  const assignStr = (key: keyof RuntimeSettings, value: unknown, maxLen: number) => {
    if (value === undefined) return
    next[key] = String(value ?? '').trim().slice(0, maxLen) as never
  }

  assignStr('cookiePrefix', input.cookiePrefix, 64)
  assignStr('trustedProxyIps', input.trustedProxyIps, 512)
  assignStr('uploadDir', input.uploadDir, 512)
  assignStr('baseUrl', input.baseUrl, 512)
  assignStr('agentChatUrl', input.agentChatUrl, 512)
  assignStr('agentHealthUrl', input.agentHealthUrl, 512)
  assignStr('turnstileSiteKey', input.turnstileSiteKey, 128)

  if (input.cookieSecure !== undefined) {
    if (!(['auto', 'force_on', 'force_off'] as const).includes(input.cookieSecure)) {
      throw new Error('INVALID_COOKIE_SECURE')
    }
    next.cookieSecure = input.cookieSecure
  }
  if (input.trustProxy !== undefined) next.trustProxy = Boolean(input.trustProxy)
  if (input.friendLinkApplyEnabled !== undefined) next.friendLinkApplyEnabled = Boolean(input.friendLinkApplyEnabled)

  const numKeys: Array<keyof RuntimeSettingsUpdateInput & keyof RuntimeSettings> = [
    'sessionExpirationSeconds',
    'sessionKeepAliveSeconds',
    'loginRateLimitMax',
    'loginRateLimitWindowSeconds',
    'captchaRateLimitMax',
    'captchaRateLimitWindowSeconds',
    'captchaTtlSeconds',
    'captchaSlideTolerance',
    'friendLinkSubmitRateLimitMax',
    'friendLinkSubmitRateLimitWindowSeconds',
    'uploadMaxBytes',
    'tempUploadTtlHours',
    'tempCleanIntervalMinutes',
    'visitLogTtlDays',
  ]
  for (const key of numKeys) {
    if (input[key] !== undefined) (next as any)[key] = input[key]
  }

  const merged = mergeSettings(next)
  if (!merged.adminAccount) throw new Error('INVALID_ADMIN_ACCOUNT')
  if (!merged.adminPasswordHash) throw new Error('ADMIN_PASSWORD_REQUIRED')
  if (!merged.authSecret) throw new Error('AUTH_SECRET_REQUIRED')

  await writeToDb(merged)
  invalidateRuntimeSettingsCache()
  setCache(merged)
  return merged
}

export function resolveCookieSecure(settings: RuntimeSettings): boolean {
  if (settings.cookieSecure === 'force_on') return true
  if (settings.cookieSecure === 'force_off') return false
  return process.env.NODE_ENV === 'production'
}
