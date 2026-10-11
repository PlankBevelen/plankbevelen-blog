import http from '~/utils/http'
import type { Article } from '@/types/data/article'
import type { NewArticle } from '@/types/request/article'

class ArticleService {
  createArticle(article: NewArticle) {
    return http.post<Article | null>('/article', article)
  }

  getArticles(page = 1, limit = 10, q?: string, sort?: string) {
    return http.getPage<Article[]>('/article', { page, limit, q, sort })
  }

  getArticle(id: number | string) {
    return http.get<Article>(`/article/${id}`)
  }

  updateArticle(id: number | string, article: NewArticle) {
    return http.post<Article | null>(`/article/${id}`, article)
  }

  deleteArticle(id: number | string) {
    return http.delete<null>(`/article/${id}`)
  }
}

export default new ArticleService()
