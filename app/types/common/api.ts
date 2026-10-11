/** 服务端统一业务信封（客户端解包后业务层不应再碰） */
export type ApiEnvelope<TData = unknown> = {
  status: number
  msg?: string
  message?: string
  data?: TData
  total?: number
}

export type PageResult<TData> = {
  data: TData
  total: number
}
