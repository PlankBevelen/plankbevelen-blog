export type SiteProject = {
  id: string
  title: string
  summary: string
  description: string
  period: string
  status: string
  accentColor: string
  tags: string[]
  highlights: string[]
  links: {
    repoUrl: string
    demoUrl: string
  }
  sort: number
}

export type SiteLocalizedText = {
  zh: string
  en: string
}

export type SiteTimelineItem = {
  id: string
  year: string
  title: SiteLocalizedText
  desc: SiteLocalizedText
  sort: number
}

export type SitePageContent = {
  about: SiteLocalizedText
  timeline: SiteLocalizedText
  project?: SiteLocalizedText
}

export type SiteContent = {
  about: SiteLocalizedText
  pages: SitePageContent
  timeline: SiteTimelineItem[]
  projects: SiteProject[]
  updatedAt?: string | null
}

export type VisitLogSummary = {
  totalVisits: number
  uniqueVisitors: number
  averageDurationMs: number
  todayVisits: number
  latestVisitedAt: string | null
  topPaths: Array<{ path: string; count: number }>
  deviceDistribution: Array<{ deviceType: string; count: number }>
}

export type VisitLogItem = {
  requestId: string
  path: string
  fullPath: string
  method: string
  statusCode: number
  ip: string
  userAgent: string
  referer: string
  acceptLanguage: string
  browser: string
  os: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'
  durationMs: number
  visitedAt: string
}

export type PublicSettings = {
  cookiePrefix: string
  sessionExpirationSeconds: number
  sessionKeepAliveSeconds: number
  agentChatUrl: string
  agentHealthUrl: string
  friendLinkApplyEnabled: boolean
  baseUrl: string
  turnstileSiteKey: string
}

export type CookieSecureMode = 'auto' | 'force_on' | 'force_off'

export type RuntimeSettingsAdminView = {
  adminAccount: string
  cookiePrefix: string
  cookieSecure: CookieSecureMode
  sessionExpirationSeconds: number
  sessionKeepAliveSeconds: number
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
  hasAdminPassword: boolean
  authSecretConfigured: boolean
  authSecretMasked: string
  turnstileSecretConfigured: boolean
  redisConfigured: boolean
  nodeEnv: string
}
