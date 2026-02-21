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

    // 默认 Headers
    const headers = {
      ...(options.headers || {}),
    }

    // 注入 Token (针对 /admin 接口)
    if (url.includes('/admin') && token) {
      headers.token = token
    }

    try {
      const response: any = await $fetch(url, {
        baseURL: this.baseURL,
        ...options,
        headers,
        // 自动解析响应
        onResponse({ response }) {
          // 这里可以进行全局的响应拦截处理
          // 例如统一的错误提示等
        },
        onResponseError({ response }) {
          // 处理 4xx, 5xx 错误
          if (response.status === 401) {
            // 处理未授权，例如跳转登录
          }
        }
      })

      // 假设后端返回格式为 { status: 200, data: ..., msg: ... }
      // 这里可以根据实际情况解包
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
