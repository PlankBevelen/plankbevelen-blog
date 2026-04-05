export interface ApiResponse<TData = unknown> {
  status: number
  msg: string
  data: TData
}