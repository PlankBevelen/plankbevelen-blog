import http from "~/utils/http"

class CategoryService {
    async getCategories() {
        return await http('/api/category')
    }
    async createCategory(name: string) {
        return await http.post('/api/category', { name })
    }
    async updateCategory(id: number | string, name: string) {
        return await http.put(`/api/category/${id}`, { name })
    }
    async deleteCategory(id: number | string) {
        return await http.delete(`/api/category/${id}`)
    }
}

export default new CategoryService()
