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

const moduleFiles = import.meta.glob('@/components/i18n/modules/*.json', { 
  eager: true 
})

const messages = {
  cn: { ...cn },
  en: { ...en }
}

Object.keys(moduleFiles).forEach((path) => {
  const module = moduleFiles[path] as any
  
  // 合并中文
  if (module.cn || module.default?.cn) {
    const cnData = module.cn || module.default.cn
    messages.cn = deepMerge(messages.cn, cnData)
  }
  
  // 合并英文
  if (module.en || module.default?.en) {
    const enData = module.en || module.default.en
    messages.en = deepMerge(messages.en, enData)
  }
})

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
