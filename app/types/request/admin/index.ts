export type AdminLoginRequest = {
  account: string
  password: string
  remember?: boolean
  turnstileToken: string
}
