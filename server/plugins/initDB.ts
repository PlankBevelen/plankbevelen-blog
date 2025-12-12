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
        console.error('db connect retry failure:', e?.message || e)
      }
    }, 60 * 1000)
  } 

  nuxtApp.hooks.hook('close', async () => {
    if (retryTimer) { clearInterval(retryTimer); retryTimer = null }
    await closeDB()
  })
});
