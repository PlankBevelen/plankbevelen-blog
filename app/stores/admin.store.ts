import { defineStore } from 'pinia'
import { useAuthentication } from '~/composables/useAuthentication'
import adminService from '@/services/admin.service'
import { useTheme } from '@/composables/useTheme'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    authenticated: false,
    userInfo: null as any,
    theme: 'light' as 'light' | 'dark',
    locale: 'zh' as 'en' | 'zh',
  }),
  getters: {
    // 登录态以服务端 session 校验结果为准（JWT 存 httpOnly cookie，前端不持有明文）
    isAuthenticated: (state) => state.authenticated,
    getTheme: (state) => state.theme,
    getLocale: (state) => state.locale,
  },
  actions: {
    /** 从服务端 session 恢复登录态（刷新 / SSR） */
    async hydrateAuth() {
      if (this.authenticated) return
      try {
        const res: any = await adminService.session()
        this.authenticated = !!res?.authenticated
      } catch {
        this.authenticated = false
      }
    },
    async login(account: string, password: string, remember: boolean, captchaId: string, captchaCode: string) {
      const res: any = await adminService.login(account, password, remember, captchaId, captchaCode)
      if (res?.status === 200) {
        this.userInfo = res.data ?? null
        this.authenticated = true
        return true
      }
      return false
    },
    async logout() {
      try {
        await adminService.logout()
      } catch (error) {
        console.log(error, '退出登录失败')
      } finally {
        this.userInfo = null
        this.authenticated = false
        useAuthentication().clearUp()
      }
      return true
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
