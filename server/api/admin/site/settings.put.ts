import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import {
  updateRuntimeSettings,
  toAdminView,
  type RuntimeSettingsUpdateInput,
} from '../../../core/runtime-settings'

const ERROR_MSG: Record<string, string> = {
  INVALID_ADMIN_ACCOUNT: '管理员账号无效',
  INVALID_ADMIN_PASSWORD: '新密码长度需在 8–128 之间',
  INVALID_AUTH_SECRET: '认证密钥长度需在 16–256 之间',
  INVALID_COOKIE_SECURE: 'Cookie Secure 模式无效',
  ADMIN_PASSWORD_REQUIRED: '必须配置管理员密码',
  AUTH_SECRET_REQUIRED: '必须配置认证密钥',
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<RuntimeSettingsUpdateInput>(event)
    const settings = await updateRuntimeSettings(body || {})
    setResponseStatus(event, 200)
    return {
      status: 200,
      msg: '保存成功。访问日志 TTL 索引将在下次重启后按新值重建。',
      data: toAdminView(settings),
    }
  } catch (error: any) {
    const code = String(error?.message || '')
    if (ERROR_MSG[code]) {
      setResponseStatus(event, 400)
      return { status: 400, msg: ERROR_MSG[code], data: null }
    }
    console.error('保存系统配置失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
