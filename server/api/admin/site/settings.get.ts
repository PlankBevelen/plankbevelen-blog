import { defineEventHandler, setResponseStatus } from 'h3'
import { getRuntimeSettings, toAdminView } from '../../../core/runtime-settings'

export default defineEventHandler(async (event) => {
  try {
    const settings = await getRuntimeSettings()
    setResponseStatus(event, 200)
    return { status: 200, msg: 'ok', data: toAdminView(settings) }
  } catch (error) {
    console.error('读取系统配置失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
