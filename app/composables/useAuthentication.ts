export const useAuthentication = () => {
  const config = useRuntimeConfig()

  const tokenKey = computed(() => config.public.cookiePrefix + 'user_token')
  const i18nKey = computed(() => config.public.cookiePrefix + 'i18n')
  const themeKey = computed(() => config.public.cookiePrefix + 'theme')
  const expirationTime = computed(() => Number(config.public.expirationTime))
  const keepAliveTime = computed(() => Number(config.public.keepAliveTime))

  // 内存态：登录后立刻可用，不依赖 cookie 是否已落盘（生产跳转最关键）
  const tokenState = useState<string>('admin-auth-token', () => '')

  const cookieOptions = {
    path: '/' as const,
    sameSite: 'lax' as const,
  }

  const readCookieToken = () => {
    const c = useCookie<string | undefined>(tokenKey.value, cookieOptions)
    return c.value || ''
  }

  const getToken = () => {
    if (tokenState.value) return tokenState.value
    const fromCookie = readCookieToken()
    if (fromCookie) tokenState.value = fromCookie
    return fromCookie
  }

  const setToken = (token: string, remember?: boolean) => {
    tokenState.value = token
    const rawMaxAge = remember ? expirationTime.value : keepAliveTime.value
    const maxAge =
      Number.isFinite(rawMaxAge) && rawMaxAge > 0
        ? rawMaxAge
        : 60 * 60 * 24 * 7
    const c = useCookie<string | undefined>(tokenKey.value, {
      ...cookieOptions,
      maxAge,
    })
    c.value = token
    return c
  }

  const removeToken = () => {
    tokenState.value = ''
    const c = useCookie<string | undefined>(tokenKey.value, cookieOptions)
    c.value = undefined
    return c
  }

  const setI18n = (locale: string) => {
    const c = useCookie<string | undefined>(i18nKey.value, cookieOptions)
    c.value = locale
    return c
  }

  const getI18n = () => {
    const c = useCookie<string | undefined>(i18nKey.value, cookieOptions)
    return c.value || 'zh'
  }

  const setTheme = (theme: string) => {
    const c = useCookie<string | undefined>(themeKey.value, cookieOptions)
    c.value = theme
    return c
  }

  const getTheme = () => {
    const c = useCookie<string | undefined>(themeKey.value, cookieOptions)
    return c.value || 'light'
  }

  const hashPassword = (password: string) => password

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
