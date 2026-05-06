export interface Article {
  id: string
  title: string
  tags: string[]
  category: string
  content?: string
  shortContent?: string // 300个字符
  longContent?: string // 600个字符
  // 服务端渲染的安全 HTML（可直接 v-html）
  shortHtml?: string
  longHtml?: string
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
