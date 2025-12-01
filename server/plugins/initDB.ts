import { initDB, closeDB } from "../utils/db";

export default defineNitroPlugin(async (nuxtApp) => {
  let retryTimer: NodeJS.Timeout | null = null

  const ok = await initDB()
  if (!ok) {
    console.warn('❌ 数据库初始化失败，开始每分钟重试连接')
    retryTimer = setInterval(async () => {
      try {
        const success = await initDB()
        if (success) {
          console.log('✅ 数据库重连成功，停止重试')
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
    console.log('🔄 正在关闭数据库连接...')
    if (retryTimer) { clearInterval(retryTimer); retryTimer = null }
    await closeDB()
  })
});
