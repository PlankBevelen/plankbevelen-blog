import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import { promises as fs } from 'node:fs'
import path from 'node:path'

dotenv.config()

async function main() {
  const mysqlConn = await mysql.createConnection({
    host: process.env.NUXT_DB_HOST || 'localhost',
    port: Number(process.env.NUXT_DB_PORT) || 3306,
    user: process.env.NUXT_DB_USER || 'root',
    password: process.env.NUXT_DB_PASSWORD || '',
    database: process.env.NUXT_DB_NAME || 'plankbevelen-blog'
  })

  const mongoUri =
    process.env.NUXT_MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017'

  const mongoDbName =
    process.env.NUXT_MONGO_DB ||
    process.env.MONGODB_DB ||
    'plankbevelen-blog'

  const client = new MongoClient(mongoUri)
  await client.connect()
  const db = client.db(mongoDbName)

  const [categories] = await mysqlConn.query<any[]>(
    'SELECT id, name, count, created_at, updated_at FROM categories ORDER BY id ASC'
  )
  const [tags] = await mysqlConn.query<any[]>(
    'SELECT name, count FROM tags ORDER BY count DESC, name ASC'
  )

  const [articles] = await mysqlConn.query<any[]>(
    'SELECT id, title, tags, category_id, file_path, created_at, updated_at, deleted_at FROM articles ORDER BY id ASC'
  )

  await db.collection('categories').deleteMany({})
  await db.collection('tags').deleteMany({})
  await db.collection('articles').deleteMany({})

  if (categories.length > 0) {
    await db.collection('categories').insertMany(
      categories.map((c: any) => ({
        id: Number(c.id),
        name: String(c.name),
        count: Number(c.count || 0),
        createdAt: c.created_at ? new Date(c.created_at) : new Date(),
        updatedAt: c.updated_at ? new Date(c.updated_at) : new Date()
      }))
    )
  }

  if (tags.length > 0) {
    const now = new Date()
    await db.collection('tags').insertMany(
      tags.map((t: any) => ({
        name: String(t.name),
        count: Number(t.count || 0),
        createdAt: now,
        updatedAt: now
      }))
    )
  }

  const mdRoot = path.join(process.cwd(), 'public')
  const articleDocs = await Promise.all(
    articles.map(async (a: any) => {
      let content = ''
      const filePath = String(a.file_path || '')
      if (filePath) {
        const absPath = path.join(mdRoot, filePath.replace(/^\//, ''))
        try {
          content = await fs.readFile(absPath, 'utf-8')
        } catch {
          content = ''
        }
      }

      const deletedAt = a.deleted_at ? new Date(a.deleted_at) : null

      return {
        id: Number(a.id),
        title: String(a.title || ''),
        tags: String(a.tags || '')
          .replace(/，/g, ',')
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean),
        categoryId: Number(a.category_id),
        content,
        createdAt: a.created_at ? new Date(a.created_at) : new Date(),
        updatedAt: a.updated_at ? new Date(a.updated_at) : new Date(),
        ...(deletedAt ? { deletedAt } : {})
      }
    })
  )

  if (articleDocs.length > 0) {
    await db.collection('articles').insertMany(articleDocs)
  }

  const maxArticleId = articleDocs.reduce((m, a) => Math.max(m, a.id), 0)
  const maxCategoryId = (categories || []).reduce((m: number, c: any) => Math.max(m, Number(c.id)), 0)

  await db.collection('counters').updateOne(
    { _id: 'articles' },
    { $set: { seq: maxArticleId } },
    { upsert: true }
  )
  await db.collection('counters').updateOne(
    { _id: 'categories' },
    { $set: { seq: maxCategoryId } },
    { upsert: true }
  )

  await mysqlConn.end()
  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})

