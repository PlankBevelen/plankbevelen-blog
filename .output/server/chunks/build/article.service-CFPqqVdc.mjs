import { h as http } from './server.mjs';

class ArticleService {
  async createArticle(article) {
    return await http.post("/article", article);
  }
  async getArticles(page = 1, limit = 10, q, sort) {
    return await http.get("/article", { page, limit, q, sort });
  }
  async getArticle(id) {
    return await http.get(`/article/${id}`);
  }
  async updateArticle(id, article) {
    return await http.post(`/article/${id}`, article);
  }
  async deleteArticle(id) {
    return await http.delete(`/article/${id}`);
  }
}
const articleService = new ArticleService();

export { articleService as a };
//# sourceMappingURL=article.service-CFPqqVdc.mjs.map
