export interface NewArticle {
  title: string
  tags: string[]
  category: string
  content: string
  tempId?: string
  pinned?: boolean
}

export type ArticleListQuery = {
  page?: number
  limit?: number
  q?: string
  sort?: string
}
