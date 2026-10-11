import type { FetchOptions } from 'ofetch'
import { useAuthentication } from '@/composables/useAuthentication'
import {
  ApiError,
  isApiEnvelope,
  isRecord,
  toApiError,
  type ApiEnvelope,
  type PageResult,
} from '@/types/common/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'
type QueryParams = Record<string, string | number | boolean | undefined | null>
type RequestOptions = Omit<FetchOptions, 'method' | 'body' | 'query' | 'baseURL'>
type RequestBody = BodyInit | Record<string, unknown> | object | null

function envelopeMessage(body: ApiEnvelope): string {
  return String(body.msg || body.message || `请求失败 (${body.status})`)
}

function assertBusinessOk(body: unknown): asserts body is ApiEnvelope {
  if (!isApiEnvelope(body)) {
    throw new ApiError(500, '响应格式无效', body)
  }
  if (body.status !== 200) {
    throw new ApiError(body.status, envelopeMessage(body), body.data)
  }
}

/** 解包 data；无 data 时返回去掉 status/msg 后的剩余字段（如 session） */
function unwrapData<T>(body: unknown): T {
  assertBusinessOk(body)
  if ('data' in body) {
    return body.data as T
  }
  const { status: _s, msg: _m, message: _msg, total: _t, ...rest } = body
  return rest as T
}

function unwrapPage<T>(body: unknown): PageResult<T> {
  assertBusinessOk(body)
  return {
    data: (body.data as T) ?? (null as T),
    total: Number(body.total ?? 0),
  }
}

class Http {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.NUXT_PUBLIC_BASE_URL || '/api'
  }

  private async request<T>(
    url: string,
    options: RequestOptions & {
      method?: HttpMethod
      body?: RequestBody
      query?: QueryParams
      page?: boolean
    } = {}
  ): Promise<T> {
    const method = (options.method || 'GET').toUpperCase() as HttpMethod
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    }

    if (method !== 'GET' && method !== 'HEAD') {
      const csrf = useAuthentication().getCsrfToken()
      if (csrf) headers['X-CSRF-Token'] = csrf
    }

    const { page, body, query, ...fetchOptions } = options

    try {
      const response = await $fetch<unknown>(url, {
        ...fetchOptions,
        baseURL: this.baseURL,
        method,
        body: body ?? undefined,
        query,
        credentials: 'include',
        headers,
        onResponseError({ response }) {
          if (response.status === 401 && import.meta.client) {
            const path = window.location.pathname
            if (path.includes('/admin') && !path.includes('/admin/login')) {
              void navigateTo('/admin/login')
            }
          }
        },
      })

      if (page) {
        return unwrapPage(response) as T
      }
      return unwrapData<T>(response)
    } catch (error: unknown) {
      // 业务信封已在 HTTP 2xx 内抛出的 ApiError
      if (error instanceof ApiError) throw error
      // $fetch 运输错误：body 可能已是信封
      if (isRecord(error) && isApiEnvelope(error.data)) {
        throw new ApiError(
          error.data.status,
          envelopeMessage(error.data),
          error.data.data
        )
      }
      throw toApiError(error)
    }
  }

  get<T>(url: string, params?: QueryParams, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'GET', query: params })
  }

  getPage<T>(url: string, params?: QueryParams, options?: RequestOptions) {
    return this.request<PageResult<T>>(url, {
      ...options,
      method: 'GET',
      query: params,
      page: true,
    })
  }

  post<T>(url: string, body?: RequestBody, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'POST', body })
  }

  put<T>(url: string, body?: RequestBody, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'PUT', body })
  }

  delete<T>(url: string, params?: QueryParams, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'DELETE', query: params })
  }
}

export const http = new Http()
export default http
export { toApiError, ApiError }
