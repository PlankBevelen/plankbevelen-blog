import type { SiteLocalizedText } from '@/types/site'

export function resolveLocalizedText(value: SiteLocalizedText | null | undefined, locale: 'zh' | 'en') {
  if (!value) return ''
  return locale === 'en'
    ? (value.en || value.zh || '')
    : (value.zh || value.en || '')
}
