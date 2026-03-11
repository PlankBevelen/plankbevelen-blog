import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import path from 'node:path'
import fs from 'node:fs/promises'

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

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', articleId)
  
  try {
    await fs.mkdir(uploadDir, { recursive: true })
  } catch (err) {
    // Ignore if directory already exists
  }

  const uploadedFiles = []

  for (const file of files) {
    if (file.filename) {
      const ext = path.extname(file.filename)
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`
      const filePath = path.join(uploadDir, uniqueFilename)

      await fs.writeFile(filePath, file.data)

      uploadedFiles.push({
        originalName: file.filename,
        filename: uniqueFilename,
        url: `/uploads/${articleId}/${uniqueFilename}`,
        mimetype: file.type,
        size: file.data.length
      })
    }
  }

  return {
    status: 200,
    message: 'Upload successful',
    data: uploadedFiles
  }
})
