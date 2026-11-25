import { defineEventHandler, sendStream, createError, setHeader } from 'h3'
import { promises as fs, createReadStream } from 'node:fs'
import { getUploadsBaseDir, resolveUploadPath, uploadMimeType } from '../../utils/uploads'

export default defineEventHandler(async (event) => {
  const filePathParam = String(event.context.params?.path || '')
  const decision = resolveUploadPath(getUploadsBaseDir(), filePathParam)
  if (!decision.ok) {
    throw createError({ statusCode: decision.statusCode, statusMessage: decision.statusMessage })
  }
  const fullPath = decision.fullPath

  try {
    await fs.access(fullPath)
    const stats = await fs.stat(fullPath)
    
    if (!stats.isFile()) {
       throw createError({ statusCode: 404, statusMessage: 'Not a file' })
    }

    const mimeType = uploadMimeType(fullPath)
    if (!mimeType) {
      // 白名单外的类型（含存量 svg/mp4）直接拒绝，防止脚本/非预期内容回放
      throw createError({ statusCode: 403, statusMessage: 'Forbidden file type' })
    }

    setHeader(event, 'Content-Type', mimeType)
    setHeader(event, 'Content-Length', stats.size)
    setHeader(event, 'Cache-Control', 'public, max-age=86400')

    return sendStream(event, createReadStream(fullPath))
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'ENOENT') {
      throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
