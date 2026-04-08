export interface Article {
  id: string
  title: string
  tags: string[]
  category: string
  content?: string
  shortContent?: string // 600个字符
  longContent?: string // 2000个字符
  createTime: string
  updateTime: string
}

export interface NewArticle {
  title: string
  tags: string[]
  category: string
  content: string
  tempId?: string
}
