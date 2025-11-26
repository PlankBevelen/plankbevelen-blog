export interface Article {
  id: string
  title: string
  tags: string[]
  category: string
  content: string
  createTime: string
  updateTime: string
}

export interface NewArticle {
  title: string
  tags: string[]
  category: string
  content: string    
}
