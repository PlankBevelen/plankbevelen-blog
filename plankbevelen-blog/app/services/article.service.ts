import type { Article, NewArticle } from "@/types/article"
import http from "@/utils/http-common"

class ArticleService {
  async createArticle(article: NewArticle) {
    return await http.post('/article', article)
  }
}

export default new ArticleService()