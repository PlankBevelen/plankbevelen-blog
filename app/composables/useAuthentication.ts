import { sha256 } from 'js-sha256'

export const useAuthentication = () => {
  const config = useRuntimeConfig()
  
  const tokenKey = computed(() => config.public.cookiePrefix + 'user_token')
  const i18nKey = computed(() => config.public.cookiePrefix + 'i18n')
  const themeKey = computed(() => config.public.cookiePrefix + 'theme')
  const expirationTime = computed(() => Number(config.public.expirationTime))
  const keepAliveTime = computed(() => Number(config.public.keepAliveTime))
  const baseUrl = computed(() => config.public.baseUrl || '/')

  const getToken = () => {
    const c = useCookie<string | undefined>(tokenKey.value)
    return c.value || ''
  }

  const setToken = (token: string, keepAlive?: boolean) => {
    const opts: any = { path: baseUrl.value || '/', sameSite: 'lax' }
    opts.maxAge = keepAlive ? expirationTime.value : keepAliveTime.value
    const c = useCookie<string | undefined>(tokenKey.value, opts)
    c.value = token
    return c
  }

  const removeToken = () => {
    const c = useCookie<string | undefined>(tokenKey.value, { path: baseUrl.value || '/', sameSite: 'lax' })
    c.value = undefined
    return c
  }

  const setI18n = (locale: string) => {
    const c = useCookie<string | undefined>(i18nKey.value, { path: baseUrl.value || '/', sameSite: 'lax' })
    c.value = locale
    return c
  }

  const getI18n = () => {
    const c = useCookie<string | undefined>(i18nKey.value)
    return c.value || 'cn'
  }

  const setTheme = (theme: string) => {
    const c = useCookie<string | undefined>(themeKey.value, { path: baseUrl.value || '/', sameSite: 'lax' })
    c.value = theme
    return c
  }

  const getTheme = () => {
    const c = useCookie<string | undefined>(themeKey.value)
    return c.value || 'light'
  }

  const hashPassword = (password: string) => {
    return sha256(password)
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
    clearUp,
  }
}
