import articleService from '@/services/article'
import type { Article } from '@/types/data/article'

const inflight = new Map<string, Promise<Article | null>>()

export function articleDataKey(id: string) {
  return `article-${id}`
}

/** 列表悬停或预取时写入 Nuxt payload，详情页命中后不再发请求。 */
export function prefetchArticle(id: string) {
  const key = articleDataKey(id)
  if (!key || key === 'article-') return Promise.resolve(null)

  const nuxtApp = useNuxtApp()
  const cached = nuxtApp.payload.data[key]
  if (cached) return Promise.resolve(cached as Article)

  const pending = inflight.get(key)
  if (pending) return pending

  const task = articleService.getArticle(id).then((data) => {
    if (data) nuxtApp.payload.data[key] = data
    return data
  }).catch(() => null).finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, task)
  return task
}

export function readArticleCache(key: string) {
  const data = useNuxtApp().payload.data[key]
  return data || undefined
}
