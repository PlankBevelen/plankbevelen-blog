/**
 * SEO 统一管理
 * 
 * 分层职责：
 * - nuxt.config.ts  → 静态不变的 meta（charset / viewport / author / titleTemplate）
 * - app.vue         → 全局兜底（og:image / twitter:card / canonical / lang）
 * - 各页面          → 只写 title + description，特殊页面补充 keywords / ld+json
 * - useSeo.ts       → 抽离公共逻辑，避免重复代码
 */

export const SITE_URL = 'https://plankbevelen.cn'
export const SITE_IMAGE = `${SITE_URL}/img/logo.webp`
export const SITE_AUTHOR = 'PlankBevelen'
export const SITE_NAME = 'PlankBevelen 的个人博客'
export const SITE_DESCRIPTION =
  'plankbevelen 的个人博客，记录前端、创作和个人项目的持续实践。'
export const SITE_LOCALE = 'zh'

/**
 * 提取文章纯文本摘要（去除 Markdown 符号）
 */
export function extractSummary(content: string, length = 160): string {
  return content.slice(0, length * 2).replace(/[#*`>\-_\[\]!]/g, '').trim().slice(0, length)
}

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
export function useArticleSeo(options: {
  id: Ref<string>
  title: Ref<string | undefined>
  content: Ref<string | undefined>
  tags: Ref<string[]>
  createTime: Ref<string | undefined>
  updateTime: Ref<string | undefined>
}) {
  const { t } = useI18n()
  const { id, title, content, tags, createTime, updateTime } = options

  const articleUrl = computed(() => `${SITE_URL}/article/${id.value}`)
  const description = computed(() =>
    content.value ? extractSummary(content.value) : t('pages.article.articleDetail.meta.description')
  )
  const keywords = computed(() =>
    [...(tags.value || []), SITE_AUTHOR, 'plank', 'bevelen'].join(',')
  )

  useSeoMeta({
    title: () => title.value || t('pages.article.articleDetail.fallback'),
    ogTitle: () => title.value || t('pages.article.articleDetail.fallback'),
    ogType: 'article',
    ogUrl: () => articleUrl.value,
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
          image: [SITE_IMAGE],
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
