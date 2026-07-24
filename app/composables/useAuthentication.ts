export const useAuthentication = () => {
  const config = useRuntimeConfig()
  
  const tokenKey = computed(() => config.public.cookiePrefix + 'user_token')
  const i18nKey = computed(() => config.public.cookiePrefix + 'i18n')
  const themeKey = computed(() => config.public.cookiePrefix + 'theme')
  const expirationTime = computed(() => Number(config.public.expirationTime))
  const keepAliveTime = computed(() => Number(config.public.keepAliveTime))

  const cookieOptions = () => ({
    path: '/' as const,
    sameSite: 'lax' as const,
  })

  const getToken = () => {
    const c = useCookie<string | undefined>(tokenKey.value, cookieOptions())
    return c.value || ''
  }

  const setToken = (token: string, remember?: boolean) => {
    const rawMaxAge = remember ? expirationTime.value : keepAliveTime.value
    const maxAge = Number.isFinite(rawMaxAge) && rawMaxAge > 0
      ? rawMaxAge
      : 60 * 60 * 24 * 7
    const c = useCookie<string | undefined>(tokenKey.value, {
      ...cookieOptions(),
      maxAge,
    })
    c.value = token
    return c
  }

  const removeToken = () => {
    const c = useCookie<string | undefined>(tokenKey.value, cookieOptions())
    c.value = undefined
    return c
  }

  const setI18n = (locale: string) => {
    const c = useCookie<string | undefined>(i18nKey.value, cookieOptions())
    c.value = locale
    return c
  }

  const getI18n = () => {
    const c = useCookie<string | undefined>(i18nKey.value, cookieOptions())
    return c.value || 'zh'
  }

  const setTheme = (theme: string) => {
    const c = useCookie<string | undefined>(themeKey.value, cookieOptions())
    c.value = theme
    return c
  }

  const getTheme = () => {
    const c = useCookie<string | undefined>(themeKey.value, cookieOptions())
    return c.value || 'light'
  }

  const hashPassword = (password: string) => {
    return password
  }

  const clearUp = () => {
    removeToken()
    setI18n('zh')
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
