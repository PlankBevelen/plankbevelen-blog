import { useAuthentication } from "@/composables/useAuthentication"

class Http {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.NUXT_PUBLIC_BASE_URL || '/api'
  }

  private async request<T>(url: string, options: any = {}): Promise<T> {
    const { getToken } = useAuthentication()
    const token = getToken()
    const method = String(options.method || 'GET').toUpperCase()

    const headers = {
      ...(options.headers || {}),
    }

    const protectedMutationPaths = [
      '/article',
      '/category',
      '/note',
      '/note-category',
      '/tag/sync',
      '/upload',
    ]
    const shouldAttachToken = url.includes('/admin')
      || (
        method !== 'GET'
        && method !== 'HEAD'
        && protectedMutationPaths.some((prefix) => url === prefix || url.startsWith(`${prefix}/`))
      )

    if (shouldAttachToken && token) {
      headers.token = token
    }

    try {
      const response: any = await $fetch(url, {
        baseURL: this.baseURL,
        ...options,
        headers,
        onResponse() {

        },
        onResponseError({ response }: any) {
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
