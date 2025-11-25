import axios from "axios"
import { useAuthentication } from "@/composables/useAuthentication"

const baseUrl = import.meta.env.VITE_APP_BASE_API || "/"
const http = axios.create({ baseURL: baseUrl, withCredentials: true })

http.defaults.timeout = 120000

http.interceptors.request.use((config: any) => {
  if (config.url && config.url.includes("/api/admin")) {
    if (typeof window !== "undefined") {
      const { getToken } = useAuthentication()
      const token = getToken()
      if (token && config.headers && !config.headers["token"]) {
        config.headers["token"] = token
      }
    } else {
      try {
        /* const headers = useRequestHeaders(["cookie"])
        config.headers = { ...(config.headers || {}), ...headers } */
      } catch {}
    }
  }
  return config
})

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
