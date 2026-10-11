/** HTTP / 业务信封相关运行时错误与工具 */

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, msg: string, data?: unknown) {
    super(msg || `请求失败 (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isApiEnvelope(value: unknown): value is {
  status: number
  msg?: string
  message?: string
  data?: unknown
  total?: number
} {
  return isRecord(value) && typeof value.status === 'number'
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isRecord(error)) {
    const data = error.data
    if (isApiEnvelope(data)) {
      const msg = String(data.msg || data.message || error.message || '请求失败')
      return new ApiError(data.status, msg, data.data)
    }
    if (typeof error.statusCode === 'number' || typeof error.status === 'number') {
      const status = Number(error.statusCode ?? error.status)
      const msg = String(
        (isRecord(data) && (data.msg || data.message)) ||
          error.message ||
          error.statusMessage ||
          '请求失败'
      )
      return new ApiError(status, msg, data)
    }
    if (typeof error.message === 'string' && error.message) {
      return new ApiError(500, error.message, data)
    }
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message)
  }

  return new ApiError(500, '请求失败')
}
