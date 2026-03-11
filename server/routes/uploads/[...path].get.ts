import { defineEventHandler, sendStream, createError, setHeader } from 'h3'
import { promises as fs, createReadStream } from 'node:fs'
import path from 'node:path'

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
}

export default defineEventHandler(async (event) => {  
  let filePathParam = event.context.params?.path || ''
  
  if (!filePathParam) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  const cleanPath = path.normalize(String(filePathParam)).replace(/^(\.\.[\/\\])+/, '')
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const fullPath = path.resolve(uploadDir, cleanPath)

  const rel = path.relative(uploadDir, fullPath)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  try {
    await fs.access(fullPath)
    const stats = await fs.stat(fullPath)
    
    if (!stats.isFile()) {
       throw createError({ statusCode: 404, statusMessage: 'Not a file' })
    }

    const ext = path.extname(fullPath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

    setHeader(event, 'Content-Type', mimeType)
    setHeader(event, 'Content-Length', stats.size)
    setHeader(event, 'Cache-Control', 'public, max-age=86400')

    return sendStream(event, createReadStream(fullPath))
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
