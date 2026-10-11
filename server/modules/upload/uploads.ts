import path from 'node:path'
import { getRuntimeSettingsSync } from '../../core/runtime-settings'

export function getUploadsBaseDir() {
  const settings = getRuntimeSettingsSync()
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) return settings.uploadDir || '/var/www/uploads'
  return path.join(process.cwd(), 'public', 'uploads')
}

export function getTempUploadsDir() {
  return path.join(getUploadsBaseDir(), 'temp')
}
