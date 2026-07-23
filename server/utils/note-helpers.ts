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

export function slugifyNoteCategoryId(name: string): string {
  const base = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `note-cat-${Date.now().toString(36)}`
}

export async function allocateNoteCategoryId(
  name: string,
  ctx: { db: Db; session?: ClientSession }
): Promise<string> {
  const { noteCategories } = getCollections(ctx.db)
  const opts = ctx.session ? { session: ctx.session } : undefined
  const base = slugifyNoteCategoryId(name)
  let candidate = base
  let suffix = 0
  while (await noteCategories.findOne({ id: candidate }, opts)) {
    suffix += 1
    candidate = `${base}-${suffix}`
  }
  return candidate
}

export function buildNoteNav(
  categoryId: string,
  noteRows: Array<{
    id: number | string
    title?: string
    chapter?: string
    chapterOrder?: number
    noteOrder?: number
  }>
) {
  const sortNotes = (items: typeof noteRows) =>
    [...items].sort(
      (a, b) =>
        Number(a.noteOrder || 0) - Number(b.noteOrder || 0) ||
        Number(a.id) - Number(b.id)
    )

  const toItem = (item: (typeof noteRows)[number], chapter = '') => ({
    id: String(item.id),
    title: String(item.title || ''),
    chapter
  })

  const flatRows: typeof noteRows = []
  const notesByChapter = new Map<string, { chapterOrder: number; items: typeof noteRows }>()

  for (const note of noteRows || []) {
    const chapter = String(note.chapter || '').trim()
    if (!chapter) {
      flatRows.push(note)
      continue
    }
    const currentGroup = notesByChapter.get(chapter)
    const nextOrder = Number(note.chapterOrder || 0)
    if (!currentGroup) {
      notesByChapter.set(chapter, { chapterOrder: nextOrder, items: [note] })
      continue
    }
    currentGroup.items.push(note)
    currentGroup.chapterOrder = Math.min(currentGroup.chapterOrder, nextOrder)
  }

  const flatItems = sortNotes(flatRows).map((item) => toItem(item, ''))
  const navGroups = Array.from(notesByChapter.entries())
    .map(([chapter, group]) => {
      const items = sortNotes(group.items)
      return {
        id: `${categoryId}:${chapter}`,
        title: chapter,
        count: items.length,
        chapterOrder: Number(group.chapterOrder || 0),
        items: items.map((item) => toItem(item, chapter))
      }
    })
    .sort((a, b) => a.chapterOrder - b.chapterOrder || a.title.localeCompare(b.title, 'zh-CN'))

  return { flatItems, navGroups }
}

/** @deprecated 使用 buildNoteNav */
export function buildNoteNavGroups(
  categoryId: string,
  noteRows: Array<{
    id: number | string
    title?: string
    chapter?: string
    chapterOrder?: number
    noteOrder?: number
  }>
) {
  return buildNoteNav(categoryId, noteRows).navGroups
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
