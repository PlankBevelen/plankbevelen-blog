import path from 'node:path'

export function getUploadsBaseDir() {
  const envDir = (process.env.UPLOAD_STORAGE_DIR || '').trim()
  if (envDir) return path.resolve(envDir)

  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) return '/var/www/plankbevelen-blog/uploads'

  return path.join(process.cwd(), 'public', 'uploads')
}

export function getTempUploadsDir() {
  return path.join(getUploadsBaseDir(), 'temp')
}

