export type AdminSessionResponse = {
  authenticated: boolean
}

export type AdminDashboardResponse = {
  totalArticles: number
  totalCategories: number
  totalTags: number
  recentArticles: Array<{
    id: string
    title: string
    created_at: string | Date
    category_id?: string | number
  }>
  categoryStats: Array<{ name: string; value: number }>
  tagStats: Array<{ name: string; value: number }>
  publishTrend: Array<{ date: string; count: number }>
}
