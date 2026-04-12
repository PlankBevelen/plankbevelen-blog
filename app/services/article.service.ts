import type { Article, NewArticle } from "@/types/article"
import http from "~/utils/http"
import type { ApiResponse } from "~/types/api"
class ArticleService {
  async createArticle(article: NewArticle) {
    return await http.post<ApiResponse>('/article', article)
  }
  async getArticles(
    page: number = 1,
    limit: number = 10,
    q?: string,
    sort?: string,
    categoryId?: number | string
  ) {
    return await http.get<ApiResponse<Article[]>>('/article', { page, limit, q, sort, categoryId })
  }
  async getArticle(id: number | string) {
    return await http.get<ApiResponse<Article>>(`/article/${id}`)
  }
  async updateArticle(id: number | string, article: NewArticle) {
    return await http.post<ApiResponse>(`/article/${id}`, article)
  }
  async deleteArticle(id: number | string) {
    return await http.delete<ApiResponse>(`/article/${id}`)
  }
}

export default new ArticleService()
