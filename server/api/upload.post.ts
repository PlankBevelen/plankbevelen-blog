import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import path from 'node:path'
import fs from 'node:fs/promises'
import { getUploadsBaseDir } from '../utils/uploads'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function uploadMaxBytes(): number {
  const raw = Number(process.env.UPLOAD_MAX_BYTES)
  return Number.isFinite(raw) && raw > 0 ? raw : 5242880
}

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)

  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
  }

  // 每请求调用，避免模块加载时求值导致 env 时机问题
  const uploadBase = getUploadsBaseDir()

  const articleIdPart = files.find((f) => f.name === 'articleId')
  let articleId = articleIdPart ? articleIdPart.data.toString() : 'temp'

  articleId = articleId.replace(/[^a-zA-Z0-9-]/g, '')
  if (!articleId) articleId = 'temp'

  const isArticleId = /^\d+$/.test(articleId)
  const uploadSubdir = isArticleId ? articleId : path.join('temp', articleId)
  const uploadDir = path.join(uploadBase, uploadSubdir)

  const maxBytes = uploadMaxBytes()
  const uploadFiles = files.filter((f) => f.name !== 'articleId' && f.filename)

  // 先校验（扩展名 + MIME 白名单 + 大小），全部通过再写入
  for (const file of uploadFiles) {
    const ext = path.extname(file.filename || '').toLowerCase()
    const mime = String(file.type || '').toLowerCase()
    const mimeOk = !mime || ALLOWED_MIME_TYPES.includes(mime)
    if (!ALLOWED_EXTENSIONS.includes(ext) || !mimeOk) {
      throw createError({ statusCode: 400, statusMessage: `Unsupported file type: ${ext || mime}` })
    }
    if (file.data.length > maxBytes) {
      throw createError({ statusCode: 400, statusMessage: 'File too large' })
    }
  }

  await fs.mkdir(uploadDir, { recursive: true })

  const uploadedFiles = []
  for (const file of uploadFiles) {
    const ext = path.extname(file.filename || '').toLowerCase()
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    const filePath = path.join(uploadDir, uniqueFilename)

    await fs.writeFile(filePath, file.data)

    const urlSubPath = uploadSubdir.split(path.sep).join('/')
    uploadedFiles.push({
      originalName: file.filename,
      filename: uniqueFilename,
      url: `/uploads/${urlSubPath}/${uniqueFilename}`,
      mimetype: file.type,
      size: file.data.length,
    })
  }

  return {
    status: 200,
    message: 'Upload successful',
    data: uploadedFiles,
  }
})
