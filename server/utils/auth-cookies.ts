/**
 * 与登录签发使用同一套运行时配置（Mongo runtime-settings）。
 * 不要在这里再读 useRuntimeConfig()，否则 Cookie 名和 Secure 会和登录对不上。
 */
export {
  accessTokenCookieName,
  csrfCookieName,
  sessionMaxAgeSeconds,
  setAuthCookies,
  clearAuthCookies,
  readAccessToken,
  readCsrfCookie,
} from '../core/auth-cookies'
