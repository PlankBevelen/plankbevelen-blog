import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

// 不需要显示loading的接口列表
export const excludeLoadingList: string[] = [
  '/api/user/check-login',
  '/api/user/refresh-token',
  '/api/blog/heartbeat'
]

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:4008/api' : process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器
http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加loading状态（可选）
    if (config.url && excludeLoadingList.indexOf(config.url) === -1) {
      // 这里可以添加全局loading逻辑
      console.log('Request started:', config.url)
    }

    // 添加认证token
    if (process.client) {
      const userStore = useUserStore()
      const token = userStore.token  
      
      // 确保token存在且不为空
      if (token && token.trim() !== '' && config.headers) {
        console.log('userStore - token存在，添加到请求头', token)
        config.headers['Authorization'] = `Bearer ${token}`
      } else {
        console.log('userStore - token不存在或为空，移除请求头中的Authorization')
        if (config.headers && config.headers['Authorization']) {
          delete config.headers['Authorization']
        }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 隐藏loading状态（可选）
    if (response.config.url && excludeLoadingList.indexOf(response.config.url) === -1) {
      console.log('Request completed:', response.config.url)
    }

    // 统一处理响应数据
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  },
  // 处理错误响应
  (error) => {
    // 隐藏loading状态（可选）
    if (error.config?.url && excludeLoadingList.indexOf(error.config.url) === -1) {
      console.log('Request failed:', error.config.url)
    }

    if (error.response?.status) {
      switch (error.response.status) {
        case 401:
          // 未登录或token过期
          if (process.client) {
            const router = useRouter()
            const route = useRoute()
            const userStore = useUserStore()
            
            // 避免在登录页面重复跳转
            if (route.path !== '/login') {
              ElMessageBox.confirm(
                '登录已过期，请重新登录',
                '提示',
                {
                  confirmButtonText: '重新登录',
                  cancelButtonText: '取消',
                  type: 'warning'
                }
              ).then(() => {
                userStore.logout()
                router.push({
                  path: '/login',
                  query: {
                    redirect: route.fullPath
                  }
                })
              }).catch(() => {
                userStore.logout()
                router.push('/login')
              })
            }
          }
          break
        case 403:
          // 权限不足
          if (process.client) {
            ElMessage.error('权限不足，无法访问该资源')
          }
          break
        case 404:
          // 资源不存在
          if (process.client) {
            ElMessage.error('请求的资源不存在')
            const router = useRouter()
            router.push('/404')
          }
          break
        case 500:
          // 服务器错误
          if (process.client) {
            ElMessage.error('服务器内部错误，请稍后重试')
          }
          break
        default:
          // 其他错误
          if (process.client) {
            ElMessage.error(error.response.data?.message || '请求失败，请稍后重试')
          }
      }
      return Promise.reject(error.response)
     } else {
       // 网络错误或其他错误
       console.error('Request error:', error)
       
       if (process.client) {
         if (error.message === 'Network Error') {
           // 网络连接错误
           ElMessage.error('网络连接失败，请检查网络设置')
         } else if (error.code === 'ECONNABORTED') {
           // 请求超时
           ElMessage.error('请求超时，请稍后重试')
         } else {
           // 其他未知错误
           ElMessage.error('请求失败，请稍后重试')
         }
       }
       
       return Promise.reject(error)
     }
   }
)

// 导出axios实例
export default http

// 导出常用的请求方法
export const get = (url: string, config?: AxiosRequestConfig) => {
  return http.get(url, config)
}

export const post = (url: string, data?: any, config?: AxiosRequestConfig) => {
  return http.post(url, data, config)
}

export const put = (url: string, data?: any, config?: AxiosRequestConfig) => {
  return http.put(url, data, config)
}

export const del = (url: string, config?: AxiosRequestConfig) => {
  return http.delete(url, config)
}
