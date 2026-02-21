import http from "~/utils/http"

class CategoryService {
    async getCategories() {
        return await http.get('/category')
    }
    async createCategory(name: string) {
        return await http.post('/category', { name })
    }
    async updateCategory(id: number | string, name: string) {
        return await http.put(`/category/${id}`, { name })
    }
    async deleteCategory(id: number | string) {
        return await http.delete(`/category/${id}`)
    }
}

export default new CategoryService()
