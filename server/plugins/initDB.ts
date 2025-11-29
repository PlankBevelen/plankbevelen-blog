import { initDB, closeDB } from "../utils/db";

export default defineNitroPlugin(async (nuxtApp) => {
  await initDB();
  console.log('📦 数据库初始化插件已执行');

  nuxtApp.hooks.hook('close', async () => {
    console.log('🔄 正在关闭数据库连接...')
    await closeDB()
  })
});
