import { initDB } from "../utils/db";

export default defineNitroPlugin(async (nuxtApp) => {
  await initDB();
  console.log('📦 数据库初始化插件已执行');
});
