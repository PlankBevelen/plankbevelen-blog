import { useAuthentication } from "@/composables/useAuthentication"

class Http {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.NUXT_PUBLIC_BASE_URL || '/api'
  }

  private async request<T>(url: string, options: any = {}): Promise<T> {
    const method = String(options.method || 'GET').toUpperCase()
    const headers: Record<string, string> = { ...(options.headers || {}) }

    // 非 GET 写请求：读取 CSRF cookie，设置 X-CSRF-Token（双提交）
    if (method !== 'GET' && method !== 'HEAD') {
      const csrf = useAuthentication().getCsrfToken()
      if (csrf) headers['X-CSRF-Token'] = csrf
    }

    try {
      const response: any = await $fetch(url, {
        baseURL: this.baseURL,
        ...options,
        credentials: 'include',
        headers,
        onResponseError({ response }: any) {
          if (response.status === 401) {
            // 未授权：交由调用方 / 路由守卫处理
          }
        }
      })
      return response
    } catch (error: any) {
      console.error('Request Error:', error)
      throw error
    }
  }

  get<T>(url: string, params?: any, options?: any) {
    return this.request<T>(url, { ...options, method: 'GET', query: params })
  }

  post<T>(url: string, body?: any, options?: any) {
    return this.request<T>(url, { ...options, method: 'POST', body })
  }

  put<T>(url: string, body?: any, options?: any) {
    return this.request<T>(url, { ...options, method: 'PUT', body })
  }

  delete<T>(url: string, params?: any, options?: any) {
    return this.request<T>(url, { ...options, method: 'DELETE', query: params })
  }
}

export const http = new Http()
export default http
