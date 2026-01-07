import { createI18n } from 'vue-i18n'

import cn from '@/components/i18n/lang/cn'
import en from '@/components/i18n/lang/en'


function deepMerge(target: any, source: any): any {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

const messages = {
  cn: { ...cn },
  en: { ...en }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'cn',
  fallbackLocale: 'cn',
  globalInjection: true,
  messages
})

export const t = (key: string) => {
  if (!key) return key
  return i18n.global.t(key as any) as unknown as string
}
