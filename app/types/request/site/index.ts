export type VisitLogQuery = {
  page?: number
  pageSize?: number
  days?: number
  path?: string
  deviceType?: string
}

export type RuntimeSettingsUpdatePayload = {
  adminAccount?: string
  newAdminPassword?: string
  newAuthSecret?: string
  newTurnstileSecretKey?: string
  sessionExpirationSeconds?: number
  sessionKeepAliveSeconds?: number
  cookiePrefix?: string
  cookieSecure?: 'auto' | 'force_on' | 'force_off'
  trustProxy?: boolean
  trustedProxyIps?: string
  loginRateLimitMax?: number
  loginRateLimitWindowSeconds?: number
  captchaRateLimitMax?: number
  captchaRateLimitWindowSeconds?: number
  captchaTtlSeconds?: number
  captchaSlideTolerance?: number
  friendLinkSubmitRateLimitMax?: number
  friendLinkSubmitRateLimitWindowSeconds?: number
  friendLinkApplyEnabled?: boolean
  uploadMaxBytes?: number
  uploadDir?: string
  tempUploadTtlHours?: number
  tempCleanIntervalMinutes?: number
  baseUrl?: string
  agentChatUrl?: string
  agentHealthUrl?: string
  visitLogTtlDays?: number
  turnstileSiteKey?: string
}
