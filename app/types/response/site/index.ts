import type { VisitLogItem, VisitLogSummary } from '@/types/data/site'

export type VisitLogResponse = {
  summary: VisitLogSummary
  list: VisitLogItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    days: number
  }
}

export type SiteInfoResponse = {
  siteName: string
  siteUrl: string
  siteAuthor: string
  siteDescription: string
  defaultLocale: string
  content: {
    totalArticles: number
    totalCategories: number
    totalTags: number
    latestUpdatedAt: string | null
  }
  seo: {
    sitemap: string
    robots: string
    canonicalEnabled: boolean
    adminBlocked: boolean
  }
  stack: {
    framework: string
    ui: string
    database: string
    runtime: string
    renderMode: string
  }
}

export type SiteMetricsResponse = {
  traffic: {
    status: string
    hint: string
    pv: number
    uv: number
    latestVisitedAt: string | null
    topPaths: Array<{ path: string; count: number }>
  }
  content: {
    totalArticles: number
    articlesLast30Days: number
    averageContentLength: number
  }
  assets: {
    publicFiles: number
    publicSize: number
    uploadFiles: number
    uploadSize: number
    bundleFiles: number
    bundleSize: number
  }
  publishTrend: Array<{ date: string; count: number }>
  categoryStats: Array<{ name: string; value: number }>
}
