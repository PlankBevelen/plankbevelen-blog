import http from '~/utils/http'
import type { Category } from '@/types/data/category'

class CategoryService {
  getCategories() {
    return http.get<Category[]>('/category')
  }

  createCategory(name: string) {
    return http.post<Category>('/category', { name })
  }

  updateCategory(id: number | string, name: string) {
    return http.put<Category>(`/category/${id}`, { name })
  }

  deleteCategory(id: number | string) {
    return http.delete<null>(`/category/${id}`)
  }
}

export default new CategoryService()
