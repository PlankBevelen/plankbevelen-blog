import type { Article, NewArticle } from "@/types/article"
import http from "@/utils/http-common"

class ArticleService {
  async createArticle(article: NewArticle) {
    return await http.post('/api/article', article)
  }
  async getArticles(page: number = 1, limit: number = 10, q?: string) {
    return await http.get('/api/article', { params: { page, limit, q } })
  }
  async getArticle(id: number | string) {
    return await http.get(`/api/article/${id}`)
  }
  async updateArticle(id: number | string, article: NewArticle) {
    return await http.post(`/api/article/${id}`, article)
  }
  async deleteArticle(id: number | string) {
    return await http.delete(`/api/article/${id}`)
  }
}

export default new ArticleService()
