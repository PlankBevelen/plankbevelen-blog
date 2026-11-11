export type ArticleNavLink = {
  id: string
  title: string
}

export interface Article {
  id: string
  title: string
  tags: string[]
  category: string
  content?: string
  shortContent?: string
  longContent?: string
  shortHtml?: string
  longHtml?: string
  createTime: string
  updateTime: string
  pinned?: boolean
  pinnedAt?: string | null
  prev?: ArticleNavLink | null
  next?: ArticleNavLink | null
}
