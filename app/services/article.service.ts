import type { Article, NewArticle } from "@/types/article"
import http from "~/utils/http"

class ArticleService {
  async createArticle(article: NewArticle) {
    return await http.post('/article', article)
  }
  async getArticles(page: number = 1, limit: number = 10, q?: string, sort?: string) {
    return await http.get('/article', { page, limit, q, sort })
  }
  async getArticle(id: number | string) {
    return await http.get(`/article/${id}`)
  }
  async updateArticle(id: number | string, article: NewArticle) {
    return await http.post(`/article/${id}`, article)
  }
  async deleteArticle(id: number | string) {
    return await http.delete(`/article/${id}`)
  }
}

export default new ArticleService()
