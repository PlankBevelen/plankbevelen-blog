import type { Article } from '@/types/data/article'
import type { Category } from '@/types/data/category'
import type { Tag } from '@/types/data/tag'
import type { SiteProject } from '@/types/data/site'

export type HomeStats = {
  articles: number
  categories: number
  tags: number
}

export type HomeDataResponse = {
  latestArticles: Article[]
  featuredProjects: SiteProject[]
  categories: Category[]
  tags: Tag[]
  stats: HomeStats | null
}

export type SidebarDataResponse = {
  stats: HomeStats | null
  categories: Category[]
  tags: Tag[]
  latestArticles: Array<Pick<Article, 'id' | 'title' | 'category' | 'createTime'>>
}
