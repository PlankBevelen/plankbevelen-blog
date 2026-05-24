import type { ClientSession, Db } from 'mongodb'
import { getCollections } from './mongo'

function parseTagsInput(tags: string | string[] | null | undefined): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return Array.from(new Set(tags.map(item => String(item).trim()).filter(Boolean)))
  }
  return Array.from(
    new Set(
      String(tags)
        .replace(/，/g, ',')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    )
  )
}

export async function updateNoteCategoryCount(
  oldCategoryId: number | string | null,
  newCategoryId: number | string | null,
  ctx: { db: Db; session?: ClientSession }
) {
  const { noteCategories } = getCollections(ctx.db)
  const now = new Date()
  const oldId = oldCategoryId ? String(oldCategoryId).trim() : null
  const newId = newCategoryId ? String(newCategoryId).trim() : null

  if (oldId === newId) return

  if (oldId) {
    await noteCategories.updateOne(
      { id: oldId },
      [
        {
          $set: {
            count: { $cond: [{ $gt: ['$count', 0] }, { $subtract: ['$count', 1] }, 0] },
            updatedAt: now
          }
        }
      ],
      ctx.session ? { session: ctx.session } : undefined
    )
  }

  if (newId) {
    await noteCategories.updateOne(
      { id: newId },
      { $inc: { count: 1 }, $set: { updatedAt: now } },
      ctx.session ? { session: ctx.session } : undefined
    )
  }
}

export async function updateNoteTagsCount(
  oldTags: string | string[] | null,
  newTags: string | string[] | null,
  ctx: { db: Db; session?: ClientSession }
) {
  const { tags } = getCollections(ctx.db)
  const now = new Date()
  const oldSet = new Set(parseTagsInput(oldTags))
  const newSet = new Set(parseTagsInput(newTags))
  const add = [...newSet].filter(item => !oldSet.has(item))
  const remove = [...oldSet].filter(item => !newSet.has(item))
  const opts = ctx.session ? { session: ctx.session } : undefined

  await Promise.all([
    ...add.map(name =>
      tags.updateOne(
        { name },
        { $inc: { count: 1 }, $set: { updatedAt: now }, $setOnInsert: { createdAt: now } },
        { ...opts, upsert: true }
      )
    ),
    ...remove.map(name =>
      tags.updateOne(
        { name },
        { $inc: { count: -1 }, $set: { updatedAt: now } },
        opts
      )
    )
  ])

  if (remove.length > 0) {
    await tags.deleteMany({ count: { $lte: 0 } }, opts)
  }
}
