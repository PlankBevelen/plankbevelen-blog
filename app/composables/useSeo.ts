/**
 * SEO 统一管理
 * 
 * 分层职责：
 * - nuxt.config.ts  → 静态不变的 meta（charset / viewport / author / 标题模板）
 * - app.vue         → 全局兜底（og:image / twitter:card / canonical / lang）
 * - 各页面          → 只写 title + description，特殊页面补充 keywords / ld+json
 * - useSeo.ts       → 抽离公共逻辑，避免重复代码
 */

export const SITE_URL = 'https://plankbevelen.cn'
export const SITE_IMAGE = `${SITE_URL}/img/logo.webp`
export const SITE_AUTHOR = 'plankbevelen'
export const SITE_NAME = 'plankbevelen 的个人博客'
export const SITE_DESCRIPTION =
  'plankbevelen 的个人博客，记录前端、创作和个人项目的持续实践。'
export const SITE_LOCALE = 'zh'

/**
 * 普通页面 SEO —— 用于 about / article列表 / project 等静态页面
 * 只需传 title 和 description，canonical 由 app.vue 统一处理
 */
export function usePageSeo(options: {
  title: string | (() => string)
  description: string | (() => string)
  keywords?: string | (() => string)
}) {
  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    ...(options.keywords ? { keywords: options.keywords } : {}),
  })
}

/**
 * 文章详情页 SEO —— 动态数据，支持响应式
 */
function absoluteCover(cover: string | null | undefined): string {
  if (!cover) return SITE_IMAGE
  return cover.startsWith('/') ? `${SITE_URL}${cover}` : cover
}

export function useArticleSeo(options: {
  id: Ref<string>
  title: Ref<string | undefined>
  excerpt: Ref<string | null | undefined>
  cover: Ref<string | null | undefined>
  tags: Ref<string[]>
  createTime: Ref<string | undefined>
  updateTime: Ref<string | undefined>
}) {
  const { t } = useI18n()
  const { id, title, excerpt, cover, tags, createTime, updateTime } = options

  const articleUrl = computed(() => `${SITE_URL}/article/${id.value}`)
  const description = computed(() =>
    excerpt.value || t('pages.article.articleDetail.meta.description')
  )
  const keywords = computed(() =>
    [...(tags.value || []), SITE_AUTHOR, 'plank', 'bevelen'].join(',')
  )
  const articleImage = computed(() => absoluteCover(cover.value))

  useSeoMeta({
    title: () => title.value || t('pages.article.articleDetail.fallback'),
    ogTitle: () => title.value || t('pages.article.articleDetail.fallback'),
    ogType: 'article',
    ogUrl: () => articleUrl.value,
    ogImage: () => articleImage.value,
    twitterImage: () => articleImage.value,
    description: () => description.value,
    ogDescription: () => description.value,
    keywords: () => keywords.value,
  })

  // canonical 单独覆盖（文章页 URL 带 id，需要覆盖 app.vue 的通用 canonical）
  useHead(() => ({
    link: [{ rel: 'canonical', href: articleUrl.value, key: 'canonical' }],
    script: [
      {
        key: 'article-ld',
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          url: articleUrl.value,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl.value,
          },
          headline: title.value,
          image: [articleImage.value],
          description: description.value,
          datePublished: createTime.value,
          dateModified: updateTime.value || createTime.value,
          publisher: {
            '@type': 'Person',
            name: SITE_AUTHOR,
            url: SITE_URL,
          },
          author: [{
            '@type': 'Person',
            name: SITE_AUTHOR,
            url: SITE_URL,
          }],
        }),
      },
    ],
  }))
}
