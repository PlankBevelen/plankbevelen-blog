import { createClient } from 'redis'

/**
 * 轻量 KV 存储：优先 Redis（配置了 REDIS_URL 时），否则回退进程内 Map。
 * 用于验证码、限流计数等「短生命周期、可丢失」的数据，不承载业务数据。
 */

type RedisClient = ReturnType<typeof createClient>

interface EphemeralStore {
  set(key: string, value: string, ttlSeconds: number): Promise<void>
  get(key: string): Promise<string | null>
  del(key: string): Promise<void>
  incr(key: string, ttlSeconds: number): Promise<number>
}

let memoryMap: Map<string, { value: string; expiresAt: number }> | null = null
let redisClient: RedisClient | null = null
let redisConnect: Promise<RedisClient | null> | null = null
let redisBroken = false

function getMemory() {
  if (!memoryMap) memoryMap = new Map()
  return memoryMap
}

async function getRedis(): Promise<RedisClient | null> {
  const url = process.env.REDIS_URL
  if (!url || redisBroken) return null
  if (!redisClient) {
    redisClient = createClient({ url })
    redisClient.on('error', () => {
      redisBroken = true
    })
  }
  if (!redisConnect) {
    redisConnect = redisClient
      .connect()
      .then(() => redisClient)
      .catch((error) => {
        console.error('[ephemeral-store] Redis 连接失败，回退进程内内存：', error?.message || error)
        redisBroken = true
        return null
      })
  }
  return redisConnect
}

export function getEphemeralStore(): EphemeralStore {
  const memory = getMemory()

  return {
    async set(key, value, ttlSeconds) {
      const redis = await getRedis()
      if (redis) {
        await redis.set(key, value, { EX: ttlSeconds })
        return
      }
      memory.set(key, { value: String(value), expiresAt: Date.now() + ttlSeconds * 1000 })
    },

    async get(key) {
      const redis = await getRedis()
      if (redis) return await redis.get(key)
      const item = memory.get(key)
      if (!item) return null
      if (item.expiresAt < Date.now()) {
        memory.delete(key)
        return null
      }
      return item.value
    },

    async del(key) {
      const redis = await getRedis()
      if (redis) {
        await redis.del(key)
        return
      }
      memory.delete(key)
    },

    async incr(key, ttlSeconds) {
      const redis = await getRedis()
      if (redis) {
        const value = await redis.incr(key)
        if (value === 1) await redis.expire(key, ttlSeconds)
        return value
      }
      const now = Date.now()
      const item = memory.get(key)
      const next = !item || item.expiresAt < now ? 1 : Number(item.value) + 1
      memory.set(key, { value: String(next), expiresAt: now + ttlSeconds * 1000 })
      return next
    },
  }
}
