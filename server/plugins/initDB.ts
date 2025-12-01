import { initDB, closeDB } from "../utils/db";

export default defineNitroPlugin(async (nuxtApp) => {
  let retryTimer: NodeJS.Timeout | null = null

  const ok = await initDB()
  if (!ok) {
    retryTimer = setInterval(async () => {
      try {
        const success = await initDB()
        if (success) {
          if (retryTimer) { clearInterval(retryTimer); retryTimer = null }
        }
      } catch (e: any) {
        console.error('❌ 数据库重试失败:', e?.message || e)
      }
    }, 60 * 1000)
  } else {
    console.log('📦 数据库初始化插件已执行')
  }

  nuxtApp.hooks.hook('close', async () => {
    if (retryTimer) { clearInterval(retryTimer); retryTimer = null }
    await closeDB()
  })
});
