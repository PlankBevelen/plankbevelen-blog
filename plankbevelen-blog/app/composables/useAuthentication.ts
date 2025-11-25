// app/utils/authentication.util.ts
import Cookies from 'js-cookie'
import { sha256 } from 'js-sha256'

export const useAuthentication = () => {
  const config = useRuntimeConfig()
  
  const tokenKey = computed(() => config.public.cookiePrefix + 'user_token')
  const i18nKey = computed(() => config.public.cookiePrefix + 'i18n')
  const themeKey = computed(() => config.public.cookiePrefix + 'theme')
  const expirationTime = computed(() => Number(config.public.expirationTime))
  const keepAliveTime = computed(() => Number(config.public.keepAliveTime))
  const baseUrl = computed(() => config.public.baseURL || '/')

  const getToken = () => {
    return Cookies.get(tokenKey.value) || ''
  }

  const setToken = (token: string, keepAlive?: boolean) => {
    const cookieConfig: any = { path: baseUrl.value || '/' }
    if (keepAlive) {
      cookieConfig.expires = keepAliveTime.value / (24 * 60 * 60)
    } else {
      cookieConfig.expires = expirationTime.value / (24 * 60 * 60)
    }
    return Cookies.set(tokenKey.value, token, cookieConfig)
  }

  const removeToken = () => {
    return Cookies.remove(tokenKey.value, { path: baseUrl || '/' })
  }

  const setI18n = (locale: string) => {
    return Cookies.set(i18nKey.value, locale, { path: baseUrl || '/' })
  }

  const getI18n = () => {
    return Cookies.get(i18nKey.value) || 'cn'
  }

  const setTheme = (theme: string) => {
    return Cookies.set(themeKey.value, theme, { path: baseUrl || '/' })
  }

  const getTheme = () => {
    return Cookies.get(themeKey.value) || 'light'
  }

  const hashPassword = (password: string) => {
    return sha256(password)
  }

  const isAuthenticated = () => {
    return !!getToken()
  }

  const clearUp = () => {
    removeToken()
    setI18n('cn')
    setTheme('light')
  }

  return {
    getToken,
    setToken,
    removeToken,
    setI18n,
    getI18n,
    setTheme,
    getTheme,
    hashPassword,
    isAuthenticated,
    clearUp,
    tokenKey,
    i18nKey,
    themeKey,
    expirationTime,
    keepAliveTime,
  }
}
