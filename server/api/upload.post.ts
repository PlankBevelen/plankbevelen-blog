import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import path from 'node:path'
import fs from 'node:fs/promises'
import { getUploadsBaseDir } from '../utils/uploads'

const UPLOAD_BASE = getUploadsBaseDir()

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)

  if (!files || files.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded',
    })
  }

  const articleIdPart = files.find(f => f.name === 'articleId')
  let articleId = articleIdPart ? articleIdPart.data.toString() : 'temp'

  articleId = articleId.replace(/[^a-zA-Z0-9-]/g, '')
  if (!articleId) articleId = 'temp'

  const isArticleId = /^\d+$/.test(articleId)
  const uploadSubdir = isArticleId ? articleId : path.join('temp', articleId)
  const uploadDir = path.join(UPLOAD_BASE, uploadSubdir)

  await fs.mkdir(uploadDir, { recursive: true })

  const uploadedFiles = []

  for (const file of files) {
    if (file.filename) {
      const ext = path.extname(file.filename)
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`
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
  }

  return {
    status: 200,
    message: 'Upload successful',
    data: uploadedFiles,
  }
})
