import axios from "axios"
import { useAuthentication } from "@/composables/useAuthentication"

const baseUrl = import.meta.env.BASE_URL || "/"
const http = axios.create({ baseURL: baseUrl, withCredentials: true })

http.defaults.timeout = 120000

// 请求拦截器
http.interceptors.request.use((config: any) => {
  if (config.url && config.url.includes("/api/admin")) {
    const { getToken } = useAuthentication()
    const token = getToken()

    if (token && config.headers && !config.headers["token"]) {
      config.headers["token"] = token
    }
  }
  return config
})
// 响应拦截器
http.interceptors.response.use(
  (response: any) => {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    }
    return Promise.reject(response)
  },
  (error: any) => {
    if (error && error.response && error.response.status) {
      return Promise.reject(error.response)
    }
    return Promise.reject(error)
  }
)

export default http
