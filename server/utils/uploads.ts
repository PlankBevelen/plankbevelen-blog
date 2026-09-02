import path from 'node:path'

export function getUploadsBaseDir() {
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) return process.env.UPLOAD_DIR || '/var/www/uploads'

  return path.join(process.cwd(), 'public', 'uploads')
}

export function getTempUploadsDir() {
  return path.join(getUploadsBaseDir(), 'temp')
}
