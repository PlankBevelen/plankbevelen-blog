import type { Db, ClientSession } from 'mongodb'
import { getCollections } from './mongo'

/**
 * 解析标签字符串为数组
 * 处理中文逗号，去重，去除空值
 */
function parseTagsInput(tags: string | string[] | null | undefined): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return Array.from(new Set(tags.map(t => String(t).trim()).filter(t => t.length > 0)))
  }
  return Array.from(
    new Set(
      String(tags)
        .replace(/，/g, ',')
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
    )
  )
}

/**
 * 维护标签计数
 */
export async function updateTagsCount(
  oldTags: string | string[] | null,
  newTags: string | string[] | null,
  ctx: { db: Db; session?: ClientSession }
) {
  const { tags } = getCollections(ctx.db)
  const now = new Date()

  const oldSet = new Set(parseTagsInput(oldTags))
  const newSet = new Set(parseTagsInput(newTags))

  // 找出需要增加计数的标签 (在新集合中但不在旧集合中)
  const tagsToAdd = [...newSet].filter(t => !oldSet.has(t))
  
  // 找出需要减少计数的标签 (在旧集合中但不在新集合中)
  const tagsToRemove = [...oldSet].filter(t => !newSet.has(t))

  const opts = ctx.session ? { session: ctx.session } : undefined

  await Promise.all([
    ...tagsToAdd.map(name =>
      tags.updateOne(
        { name },
        { $inc: { count: 1 }, $set: { updatedAt: now }, $setOnInsert: { createdAt: now } },
        { ...opts, upsert: true }
      )
    ),
    ...tagsToRemove.map(name =>
      tags.updateOne(
        { name },
        { $inc: { count: -1 }, $set: { updatedAt: now } },
        opts
      )
    )
  ])

  if (tagsToRemove.length > 0) {
    await tags.deleteMany({ count: { $lte: 0 } }, opts)
  }
}

/**
 * 维护分类计数
 */
export async function updateCategoryCount(
  oldCategoryId: number | string | null,
  newCategoryId: number | string | null,
  ctx: { db: Db; session?: ClientSession }
) {
  const { categories } = getCollections(ctx.db)
  const now = new Date()

  const oldId = oldCategoryId ? Number(oldCategoryId) : null
  const newId = newCategoryId ? Number(newCategoryId) : null

  if (oldId === newId) return

  // 减少旧分类计数
  if (oldId) {
    await categories.updateOne(
      { id: oldId },
      [
        {
          $set: {
            count: {
              $cond: [{ $gt: ['$count', 0] }, { $subtract: ['$count', 1] }, 0]
            },
            updatedAt: now
          }
        }
      ],
      ctx.session ? { session: ctx.session } : undefined
    )
  }

  // 增加新分类计数
  if (newId) {
    await categories.updateOne(
      { id: newId },
      { $inc: { count: 1 }, $set: { updatedAt: now } },
      ctx.session ? { session: ctx.session } : undefined
    )
  }
}
