import path from 'node:path'

const UPLOAD_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

export type UploadPathDecision =
  | { ok: true; fullPath: string }
  | { ok: false; statusCode: 403 | 404; statusMessage: string }

/** 扩展名白名单。svg 等可执行或非图片类型返回 null，由调用方拒绝。 */
export function uploadMimeType(filename: string): string | null {
  return UPLOAD_MIME_TYPES[path.extname(filename).toLowerCase()] ?? null
}

/**
 * 把上传路由里的路径参数收进 uploadDir。
 * 参数按已解码的路径段处理：`..` 逃逸返回 403，空路径返回 404。
 */
export function resolveUploadPath(uploadDir: string, filePathParam: string): UploadPathDecision {
  if (!filePathParam) {
    return { ok: false, statusCode: 404, statusMessage: 'File not found' }
  }

  const root = path.resolve(uploadDir)
  const cleanPath = path.normalize(String(filePathParam)).replace(/^(\.\.[/\\])+/, '')
  const fullPath = path.resolve(root, cleanPath)
  const rel = path.relative(root, fullPath)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return { ok: false, statusCode: 403, statusMessage: 'Access denied' }
  }
  return { ok: true, fullPath }
}

export function getUploadsBaseDir() {
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) return process.env.UPLOAD_DIR || '/var/www/uploads'

  return path.join(process.cwd(), 'public', 'uploads')
}

export function getTempUploadsDir() {
  return path.join(getUploadsBaseDir(), 'temp')
}
