import { createI18n } from 'vue-i18n'

import cn from '@/components/i18n/lang/cn'
import en from '@/components/i18n/lang/en'

export const i18n = createI18n({
  legacy: false,
  locale: 'cn',
  fallbackLocale: 'cn',
  messages: {
    en,
    cn,
  },
})

export const translate = (key: string) => {
  if (!key) return key
  return i18n.global.t(key as any) as unknown as string
}
