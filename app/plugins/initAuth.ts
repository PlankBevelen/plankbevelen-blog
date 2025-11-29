import { useAdminStore } from "~/stores/admin.store"
export default defineNuxtPlugin(async (nuxtApp) => {
  const userStore = useAdminStore(nuxtApp.$pinia) // 获取 Pinia 实例
  /* await userStore.initAuth() // 初始化登录状态（从 Cookie 读 Token 校验） */
})