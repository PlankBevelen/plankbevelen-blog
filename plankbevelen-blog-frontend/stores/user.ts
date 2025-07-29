import { defineStore } from 'pinia'
import http from '@/utils/http-common'

// 用户信息接口
export interface UserInfo {
  id: number
  nickname: string
  email: string
  avatar?: string
  created_at?: string
}

// 登录凭据接口
export interface LoginCredentials {
  email: string
  password: string
}

// 注册凭据接口
export interface RegisterCredentials {
  nickname: string
  email: string
  password: string
}

// API响应接口
export interface ApiResponse {
  message: string
  data?: any
}

// Store状态接口
export interface UserState {
  isLoggedIn: boolean
  userInfo: UserInfo | null
  token: string | null
  refreshToken: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: false,
    userInfo: null,
    token: null,
    refreshToken: null
  }),

  getters: {
    // 获取用户头像，如果没有则返回默认头像
    userAvatar: (state) => {
      if (!state.userInfo?.avatar) {
        return '/img/default-avatar.png'
      }
      
      // 检查是否为 JSON 字符串格式
      try {
        const parsed = JSON.parse(state.userInfo.avatar)
        return typeof parsed === 'string' ? parsed : state.userInfo.avatar
      } catch {
        // 如果不是 JSON 格式，直接返回原始值
        return state.userInfo.avatar
      }
    },
    
    // 获取用户昵称，如果没有则返回默认名称
    userName: (state) => {
      return state.userInfo?.nickname || '未登录'
    }
  },

  actions: {
    // 登录
    async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<ApiResponse> {
      try {
        console.log('userStore - 开始登录，调用后端API')
        
        // 调用后端API进行登录
        const response = await http.post('/user/login', credentials)
        
        console.log('userStore - 登录API响应:', response.data)
        
        if (response.data?.data) {
          const { user, token, refreshToken } = response.data.data
          
          // 更新store状态
          this.isLoggedIn = true
          this.userInfo = user
          this.token = token
          this.refreshToken = refreshToken
          
          console.log('userStore - 登录成功，token已保存:', token ? '存在' : '不存在')
          
          // 保存到localStorage
          if (process.client) {
            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('userInfo', JSON.stringify(user))
            
            if (rememberMe) {
              // 30天免登录
              const expiryDate = new Date()
              expiryDate.setDate(expiryDate.getDate() + 30)
              localStorage.setItem('rememberMe', 'true')
              localStorage.setItem('loginExpiry', expiryDate.toISOString())
            }
          }
          
          return { message: '登录成功' }
        } else {
          throw new Error('登录响应数据格式错误')
        }
      } catch (error: any) {
        console.error('登录失败:', error)
        return { message: error.response?.data?.message || error.message }
      }
    },

    // 注册
    async register(credentials: RegisterCredentials): Promise<ApiResponse> {
      try {
        console.log('userStore - 开始注册，调用后端API')
        
        // 调用后端API进行注册
        const response = await http.post('/user/register', credentials)
        
        console.log('userStore - 注册API响应:', response.data)
        
        return { message: response.data?.message || '注册成功，请登录' }
      } catch (error: any) {
        console.error('注册失败:', error)
        return { message: error.response?.data?.message || error.message }
      }
    },

    // 登出
    logout() {
      this.isLoggedIn = false
      this.userInfo = null
      this.token = null
      this.refreshToken = null
      
      // 清除localStorage
      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('loginExpiry')
      }
      
      console.log('userStore - 登出完成，token状态:', this.token ? '存在' : '不存在')
    },

    // 初始化用户状态（从localStorage恢复）
    initUserState() {
      if (process.client) {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')
        const userInfo = localStorage.getItem('userInfo')
        const rememberMe = localStorage.getItem('rememberMe')
        const loginExpiry = localStorage.getItem('loginExpiry')
        
        if (token && userInfo) {
          // 检查30天免登录是否过期
          if (rememberMe === 'true' && loginExpiry) {
            const expiryDate = new Date(loginExpiry)
            if (new Date() > expiryDate) {
              // 已过期，清除登录状态
              this.logout()
              return
            }
          }
          
          this.token = token
          this.refreshToken = refreshToken
          this.userInfo = JSON.parse(userInfo)
          this.isLoggedIn = true
        }
      }
    },

    // 刷新令牌
    async refreshAccessToken(): Promise<boolean> {
      try {
        if (!this.refreshToken) {
          return false
        }
        
        // 这里应该调用后端API刷新令牌
        // const response = await $fetch('/api/user/refresh', {
        //   method: 'POST',
        //   body: { refreshToken: this.refreshToken }
        // })
        
        // 模拟刷新成功
        this.token = 'new-mock-jwt-token'
        
        if (process.client) {
          localStorage.setItem('token', this.token)
        }
        
        return true
      } catch (error) {
        console.error('刷新令牌失败:', error)
        this.logout()
        return false
      }
    },

    // 更新用户信息
    async updateUserInfo(newInfo: Partial<UserInfo>): Promise<void> {
      try {
        // 调用后端API更新用户信息
        const response = await http.put('/user/update', newInfo)
        
        if (this.userInfo) {
          this.userInfo = { ...this.userInfo, ...newInfo }
          
          if (process.client) {
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          }
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    }
  }
})