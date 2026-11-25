export type ArticleNavLink = {
  id: string
  title: string
}

export type ArticleTocItem = {
  level: number
  title: string
}

export interface Article {
  id: string
  title: string
  tags: string[]
  category: string
  categoryId?: string
  content?: string
  html?: string
  previewHtml?: string
  excerpt?: string
  cover?: string | null
  toc?: ArticleTocItem[]
  createTime: string
  updateTime: string
  pinned?: boolean
  pinnedAt?: string | null
  prev?: ArticleNavLink | null
  next?: ArticleNavLink | null
}
