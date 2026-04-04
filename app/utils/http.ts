import { useAuthentication } from "@/composables/useAuthentication"
import { createError } from "h3"

/**
 * 统一的 HTTP 请求工具，基于 $fetch 封装
 * 自动处理 baseURL, token 注入, 响应解包和错误处理
 */
class Http {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.NUXT_PUBLIC_BASE_URL || '/api'
  }

  private async request<T>(url: string, options: any = {}): Promise<T> {
    const { getToken } = useAuthentication()
    const token = getToken()

    const headers = {
      ...(options.headers || {}),
    }

    if (url.includes('/admin') && token) {
      headers.token = token
    }

    try {
      const response: any = await $fetch(url, {
        baseURL: this.baseURL,
        ...options,
        headers,
        onResponse({ response }) {

        },
        onResponseError({ response }) {
          if (response.status === 401) {
            // 处理未授权，例如跳转登录
          }
        }
      })
      return response
    } catch (error: any) {
      // 统一错误处理
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
