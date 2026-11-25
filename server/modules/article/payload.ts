import type { ArticleTocItem } from './reading'

export type ArticleRef = {
  id: string
  title: string
}

/** 列表和写接口的公开字段。不含原文和全文 HTML，只带卡片用的一小段预览。 */
export type ArticleListItem = {
  id: string
  title: string
  tags: string[]
  category: string
  excerpt: string
  previewHtml: string
  cover: string | null
  createTime: Date | string
  updateTime: Date | string
  pinned: boolean
}

/** 详情在列表字段上增加正文 HTML 和目录。原文、分类 id 只给已登录的后台。 */
export type ArticleDetail = ArticleListItem & {
  html: string
  toc: ArticleTocItem[]
  pinnedAt: Date | string | null
  prev: ArticleRef | null
  next: ArticleRef | null
  content?: string
  categoryId?: string
}

/** 列表页码。非数字回落到 1，0 和负数也落到 1。 */
export function clampPage(page: unknown): number {
  const n = Number(page || 1)
  if (!Number.isFinite(n)) return 1
  return Math.max(1, n)
}

/** 列表每页条数。缺省 10，上限 50，下限 1。`0` 视为缺省。 */
export function clampPageSize(limit: unknown): number {
  return Math.min(50, Math.max(1, Number(limit || 10) || 10))
}

export function toArticleListItem(row: {
  id?: unknown
  title?: unknown
  tags?: unknown
  category?: unknown
  excerpt?: unknown
  previewHtml?: unknown
  cover?: unknown
  createTime?: unknown
  updateTime?: unknown
  pinned?: unknown
}): ArticleListItem {
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag)) : [],
    category: String(row.category ?? ''),
    excerpt: String(row.excerpt ?? ''),
    previewHtml: String(row.previewHtml ?? ''),
    cover: row.cover ? String(row.cover) : null,
    createTime: (row.createTime as Date | string) || '',
    updateTime: (row.updateTime as Date | string) || '',
    pinned: row.pinned === true,
  }
}
