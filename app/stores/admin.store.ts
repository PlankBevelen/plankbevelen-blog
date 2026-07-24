import { defineStore } from 'pinia'
import { useAuthentication } from '~/composables/useAuthentication'
import adminService from '@/services/admin.service'
import { useTheme } from '@/composables/useTheme'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: '' as string,
    userInfo: null as any,
    theme: 'light' as 'light' | 'dark',
    locale: 'zh' as 'en' | 'zh',
  }),
  getters: {
    // 以内存 token 为准，避免刚写入 cookie 时读不到导致进不去后台
    isAuthenticated: (state) => !!state.token,
    getTheme: (state) => state.theme,
    getLocale: (state) => state.locale,
  },
  actions: {
    /** 从 cookie 恢复登录态（刷新 / SSR） */
    hydrateAuth() {
      if (this.token) return
      const saved = useAuthentication().getToken()
      if (saved) this.token = saved
    },
    async login(account: string, password: string, remember?: boolean) {
      const rememberMe = !!remember
      const res: any = await adminService.login(
        account,
        useAuthentication().hashPassword(password),
        rememberMe
      )
      if (res?.status === 200 && res?.token) {
        this.userInfo = res.data ?? null
        this.token = res.token
        useAuthentication().setToken(res.token, rememberMe)
        return true
      }
      return false
    },
    async logout() {
      try {
        const res = await adminService.logout()
        if (res.status === 200) {
          this.userInfo = null
          this.token = ''
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
      const savedLocale = getI18n()
      this.locale = savedLocale === 'en' ? 'en' : 'zh'
      const savedTheme = getTheme()
      const { currentTheme } = useTheme()
      currentTheme.value = savedTheme === 'dark' ? 'dark' : 'light'
      this.theme = currentTheme.value
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        if (this.theme === 'dark') root.setAttribute('theme', 'dark')
        else root.removeAttribute('theme')
      }
    },
    setLocale(locale: 'en' | 'zh') {
      this.locale = locale
      useAuthentication().setI18n(locale)
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
    },
  },
})
