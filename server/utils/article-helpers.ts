import type { PoolConnection } from 'mysql2/promise'
import { execute } from './db'

/**
 * 解析标签字符串为数组
 * 处理中文逗号，去重，去除空值
 */
function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return []
  return tagsStr
    .replace(/，/g, ',')
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
}

/**
 * 维护标签计数
 */
export async function updateTagsCount(
  oldTagsStr: string | null,
  newTagsStr: string | null,
  connection: PoolConnection
) {
  const oldTags = new Set(parseTags(oldTagsStr))
  const newTags = new Set(parseTags(newTagsStr))

  // 找出需要增加计数的标签 (在新集合中但不在旧集合中)
  const tagsToAdd = [...newTags].filter(t => !oldTags.has(t))
  
  // 找出需要减少计数的标签 (在旧集合中但不在新集合中)
  const tagsToRemove = [...oldTags].filter(t => !newTags.has(t))

  // 批量增加计数
  if (tagsToAdd.length > 0) {
    const values = tagsToAdd.map(() => '(?, 1)').join(', ')
    const params = tagsToAdd
    await execute(
      `INSERT INTO tags (name, count) VALUES ${values} ON DUPLICATE KEY UPDATE count = count + 1`,
      params,
      connection
    )
  }

  // 批量减少计数
  if (tagsToRemove.length > 0) {
    // MySQL 的 IN 语法需要 (?, ?, ?)
    const placeholders = tagsToRemove.map(() => '?').join(', ')
    await execute(
      `UPDATE tags SET count = CASE WHEN count > 0 THEN count - 1 ELSE 0 END WHERE name IN (${placeholders})`,
      tagsToRemove,
      connection
    )
  }

  // 清理计数为 0 的标签
  // 注意：为了性能，可以不每次都清理，或者定期清理。但在触发器逻辑中是每次都清理的。
  if (tagsToRemove.length > 0) {
    await execute('DELETE FROM tags WHERE count <= 0', [], connection)
  }
}

/**
 * 维护分类计数
 */
export async function updateCategoryCount(
  oldCategoryId: number | string | null,
  newCategoryId: number | string | null,
  connection: PoolConnection
) {
  const oldId = oldCategoryId ? Number(oldCategoryId) : null
  const newId = newCategoryId ? Number(newCategoryId) : null

  if (oldId === newId) return

  // 减少旧分类计数
  if (oldId) {
    await execute(
      'UPDATE categories SET count = CASE WHEN count > 0 THEN count - 1 ELSE 0 END WHERE id = ?',
      [oldId],
      connection
    )
  }

  // 增加新分类计数
  if (newId) {
    await execute(
      'UPDATE categories SET count = count + 1 WHERE id = ?',
      [newId],
      connection
    )
  }
}
