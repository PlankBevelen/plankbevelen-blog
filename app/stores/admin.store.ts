import { defineStore } from 'pinia'
import { useAuthentication } from '~/composables/useAuthentication'
import adminService from '@/services/admin.service'
import { useTheme } from '@/composables/useTheme'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    userInfo: null as any,
    theme: 'light' as 'light' | 'dark',
    locale: 'zh' as 'en' | 'zh',
  }),
  getters: {
    isAuthenticated: (state) => { return !!useAuthentication().getToken() },
    getTheme: (state) => state.theme,
    getLocale: (state) => state.locale,
  },
  actions: {        
    async login(account: string, password: string, remember?: boolean) {
      const rememberMe = !!remember
      const res: any = await adminService.login(
        account,
        useAuthentication().hashPassword(password),
        rememberMe
      )
      if (res?.status === 200 && res?.token) {
        this.userInfo = res.data ?? null
        useAuthentication().setToken(res.token, rememberMe)
        // 信任接口返回的 token；勿再 getToken() 校验（useCookie 写入后可能尚未可读）
        return true
      }
      return false
    },
    async logout() {
        try {
            const res = await adminService.logout()
            if (res.status === 200) {
                this.userInfo = null
                useAuthentication().clearUp()
                return true
            }
        } catch (error) {
            console.log(error, '退出登录失败')
            return false
        }
    },
    initPreferences() {
      const { getI18n, getTheme } = useAuthentication()
      // 语言（从 Cookie 读取并保存到 Store）
      const savedLocale = getI18n()
      this.locale = (savedLocale === 'en' ? 'en' : 'zh')
      // 主题
      const savedTheme = getTheme()
      const { currentTheme } = useTheme()
      currentTheme.value = (savedTheme === 'dark' ? 'dark' : 'light')
      this.theme = currentTheme.value
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        if (this.theme === 'dark') root.setAttribute('theme', 'dark')
        else root.removeAttribute('theme')
      }
    },
    setLocale(locale: 'en' | 'zh') {
      this.locale = locale as 'en' | 'zh'
      const { setI18n } = useAuthentication()
      setI18n(locale)
    },
    setTheme(theme: 'light' | 'dark') {
        const { setTheme } = useAuthentication()
        const { currentTheme } = useTheme()
        currentTheme.value = theme
        this.theme = theme
        setTheme(theme)
        if (typeof document !== 'undefined') {
            const root = document.documentElement
            if (theme === 'dark') root.setAttribute('theme', 'dark')
            else root.removeAttribute('theme')
        }
    },
    toggleTheme() {
        const { currentTheme } = useTheme()
        const next = currentTheme.value === 'light' ? 'dark' : 'light'
        this.setTheme(next)
    }        
  }
})
