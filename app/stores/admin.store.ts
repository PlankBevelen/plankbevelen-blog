import { defineStore } from 'pinia'
import { useAuthentication } from '~/composables/useAuthentication'
import adminService from '@/services/admin.service'
import { useTheme } from '@/composables/useTheme'
import { i18n } from '@/components/i18n/index'
import { useI18n } from 'vue-i18n'

export const useAdminStore = defineStore('admin', {
    state: () => ({
        userInfo: null as any,
        theme: 'light' as 'light' | 'dark',
        locale: 'cn' as 'en' | 'cn',
    }),
    getters: {
        isAuthenticated: (state) => { return useAuthentication().getToken() !== undefined },
        getTheme: (state) => state.theme,
        getLocale: (state) => state.locale,
    },
    actions: {        
        async login(account: string, password: string, remember?: boolean) {
            try {
                const res = await adminService.login(account, useAuthentication().hashPassword(password), remember || false)
                if (res.status === 200) {
                    this.userInfo = res.data
                    useAuthentication().setToken(res.data.token, remember)
                    return true
                }
            } catch (error) {
                console.log(error, '登录失败')
                return false
            }
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
            const locale = getI18n()
            if (locale) { (i18n.global.locale as any).value = locale }
            this.locale = (locale === 'en' ? 'en' : 'cn')
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
        setLocale(locale: 'en' | 'cn') {
            this.locale = locale as 'en' | 'cn'
            (i18n.global.locale as any).value = locale
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
