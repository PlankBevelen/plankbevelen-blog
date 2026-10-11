export const useAuthentication = () => {
  const config = useRuntimeConfig()

  const csrfKey = computed(() => config.public.cookiePrefix + 'csrf')
  const i18nKey = computed(() => config.public.cookiePrefix + 'i18n')
  const themeKey = computed(() => config.public.cookiePrefix + 'theme')

  const cookieOptions = {
    path: '/' as const,
    sameSite: 'lax' as const,
  }

  /** 读取 CSRF cookie（双提交用），JWT 由服务端 httpOnly cookie 持有，不再暴露明文 */
  const getCsrfToken = () => {
    const c = useCookie<string | undefined>(csrfKey.value, cookieOptions)
    return c.value || ''
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

  const clearUp = () => {
    setI18n('zh')
    setTheme('light')
  }

  return {
    getCsrfToken,
    setI18n,
    getI18n,
    setTheme,
    getTheme,
    clearUp,
  }
}
