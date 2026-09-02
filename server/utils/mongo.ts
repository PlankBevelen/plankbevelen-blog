import dotenv from 'dotenv'
import { MongoClient, type Db, type ClientSession } from 'mongodb'

dotenv.config()

const mongoUri =
  process.env.NUXT_MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017'

const mongoDbName =
  process.env.NUXT_MONGO_DB ||
  process.env.MONGODB_DB ||
  'plankbevelen-blog'

let client: MongoClient | null = null
let db: Db | null = null

export type ArticleDoc = {
  id: number
  title: string
  tags: string[]
  categoryId: number
  content: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export type CategoryDoc = {
  id: number
  name: string
  count: number
  createdAt: Date
  updatedAt: Date
}

export type TagDoc = {
  name: string
  count: number
  createdAt: Date
  updatedAt: Date
}

export type FriendLinkDoc = {
  id: number
  name: string
  url: string
  normalizedUrl: string
  description: string
  avatar: string
  status: 'pending' | 'approved' | 'rejected'
  submitterIp?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export type SiteConfigDoc = {
  _id: string
  type: string
  data: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export type VisitLogDoc = {
  requestId: string
  path: string
  fullPath: string
  method: string
  statusCode: number
  ip: string
  userAgent: string
  referer: string
  acceptLanguage: string
  browser: string
  os: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'
  durationMs: number
  visitedAt: Date
}

type CounterDoc = {
  _id: string
  seq: number
}

function getClient(): MongoClient {
  if (!client) {
    client = new MongoClient(mongoUri, {
      maxPoolSize: Number(process.env.NUXT_MONGO_MAX_POOL_SIZE) || 10
    })
  }
  return client
}

export function getDb(): Db {
  if (!db) {
    db = getClient().db(mongoDbName)
  }
  return db
}

export async function closeDB() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

export function getCollections(dbInstance?: Db) {
  const d = dbInstance || getDb()
  return {
    articles: d.collection<ArticleDoc>('articles'),
    categories: d.collection<CategoryDoc>('categories'),
    tags: d.collection<TagDoc>('tags'),
    friendLinks: d.collection<FriendLinkDoc>('friend_links'),
    counters: d.collection<CounterDoc>('counters'),
    siteConfigs: d.collection<SiteConfigDoc>('site_configs'),
    visitLogs: d.collection<VisitLogDoc>('visit_logs')
  }
}

async function ensureIndexes(dbInstance: Db) {
  const { articles, categories, tags, friendLinks, siteConfigs, visitLogs } = getCollections(dbInstance)
  // 访问日志保留周期（TTL 自动清理，默认 180 天），避免 visit_logs 无限增长
  const visitLogTtlDays = Number(process.env.VISIT_LOG_TTL_DAYS) || 180
  const visitLogTtlSeconds = visitLogTtlDays * 24 * 60 * 60
  await Promise.all([
    articles.createIndex({ id: 1 }, { unique: true, name: 'uniq_id' }),
    articles.createIndex({ deletedAt: 1, createdAt: -1, id: -1 }, { name: 'by_created' }),
    articles.createIndex({ deletedAt: 1, updatedAt: -1, createdAt: -1, id: -1 }, { name: 'by_updated' }),
    articles.createIndex({ categoryId: 1 }, { name: 'by_category' }),
    articles.createIndex({ title: 'text', tags: 'text' }, { name: 'text_title_tags' }),
    categories.createIndex({ id: 1 }, { unique: true, name: 'uniq_id' }),
    tags.createIndex({ name: 1 }, { unique: true, name: 'uniq_name' }),
    friendLinks.createIndex({ id: 1 }, { unique: true, name: 'uniq_id' }),
    friendLinks.createIndex({ status: 1, deletedAt: 1, id: 1 }, { name: 'by_status' }),
    siteConfigs.createIndex({ type: 1 }, { name: 'by_type' }),
    visitLogs.createIndex({ requestId: 1 }, { unique: true, name: 'uniq_request_id' }),
    visitLogs.createIndex({ visitedAt: -1 }, { name: 'by_visited_at' }),
    visitLogs.createIndex({ visitedAt: 1 }, { expireAfterSeconds: visitLogTtlSeconds, name: 'ttl_visited_at' }),
    visitLogs.createIndex({ path: 1, visitedAt: -1 }, { name: 'by_path_visited_at' }),
    visitLogs.createIndex({ ip: 1, visitedAt: -1 }, { name: 'by_ip_visited_at' }),
    visitLogs.createIndex({ deviceType: 1, visitedAt: -1 }, { name: 'by_device_visited_at' })
  ])
}

export async function initDB() {
  try {
    const c = getClient()
    await c.connect()
    const d = getDb()
    await d.command({ ping: 1 })
    await ensureIndexes(d)
    return true
  } catch (error: any) {
    console.error('❌ MongoDB 连接初始化失败:', error?.message || error)
    return false
  }
}

export async function withTransaction<T>(
  callback: (ctx: { db: Db; session?: ClientSession }) => Promise<T>
): Promise<T> {
  const d = getDb()
  const c = getClient()
  const session = c.startSession()
  try {
    return await session.withTransaction(async () => callback({ db: d, session }))
  } catch (error: any) {
    const msg = String(error?.message || '')
    if (
      msg.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
      msg.includes('replica set') ||
      msg.includes('mongos')
    ) {
      return await callback({ db: d })
    }
    throw error
  } finally {
    await session.endSession()
  }
}

export async function getNextSequence(
  key: string,
  ctx?: { db: Db; session?: ClientSession }
): Promise<number> {
  const d = ctx?.db || getDb()
  const { counters } = getCollections(d)
  const res = await counters.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after', session: ctx?.session }
  )
  return Number(res?.seq || 1)
}
