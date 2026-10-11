import { defineStore } from 'pinia'
import { useAuthentication } from '~/composables/useAuthentication'
import adminService from '@/services/admin'
import { useTheme } from '@/composables/useTheme'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    authenticated: false,
    userInfo: null as Record<string, unknown> | null,
    theme: 'light' as 'light' | 'dark',
    locale: 'zh' as 'en' | 'zh',
  }),
  getters: {
    isAuthenticated: (state) => state.authenticated,
    getTheme: (state) => state.theme,
    getLocale: (state) => state.locale,
  },
  actions: {
    async hydrateAuth() {
      if (this.authenticated) return
      try {
        const session = await adminService.session()
        this.authenticated = !!session.authenticated
      } catch {
        this.authenticated = false
      }
    },
    async login(
      account: string,
      password: string,
      remember: boolean,
      captchaId: string,
      captchaCode: string
    ) {
      await adminService.login(account, password, remember, captchaId, captchaCode)
      this.userInfo = null
      this.authenticated = true
      return true
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
