import { defineEventHandler, getRouterParams, sendStream, createError, setHeader } from 'h3'
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
  const params = getRouterParams(event)
  // The param name depends on the filename structure. For [...path].ts, it is 'path'
  // But Nuxt/Nitro might return it as a string or array depending on version/config?
  // Usually for catch-all route [...path], event.context.params.path is the string.
  // But getRouterParams returns the decoded params object.
  
  let filePathParam = event.context.params?.path || ''
  
  if (!filePathParam) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  // If path is array (some versions), join it
  // But usually for file system routes it's a string with slashes
  // However, decodeURIComponent is needed if the URL has %20 etc.
  
  // Clean the path to prevent directory traversal
  // path.normalize resolves '..' segments
  const cleanPath = path.normalize(filePathParam).replace(/^(\.\.[\/\\])+/, '')
  
  // Construct absolute path
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const fullPath = path.join(uploadDir, cleanPath)

  // Double check it is still inside uploadDir
  if (!fullPath.startsWith(uploadDir)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  try {
    // Check existence
    await fs.access(fullPath)
    const stats = await fs.stat(fullPath)
    
    if (!stats.isFile()) {
       throw createError({ statusCode: 404, statusMessage: 'Not a file' })
    }

    const ext = path.extname(fullPath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

    setHeader(event, 'Content-Type', mimeType)
    setHeader(event, 'Content-Length', stats.size)
    // Cache control
    setHeader(event, 'Cache-Control', 'public, max-age=86400') // 1 day

    return sendStream(event, createReadStream(fullPath))
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
