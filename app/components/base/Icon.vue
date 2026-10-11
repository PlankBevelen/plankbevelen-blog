<script setup lang="ts">
import type { Component } from 'vue'
import {
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Files,
  Gauge,
  LogOut,
  MapPin,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Tag,
} from '@lucide/vue'
import githubSvg from '~/assets/icons/github.svg?raw'
import gmailSvg from '~/assets/icons/gmail.svg?raw'
import juejinSvg from '~/assets/icons/juejin.svg?raw'
import wechatSvg from '~/assets/icons/wechat.svg?raw'

const lucideIcons = {
  briefcase: Briefcase,
  calendar: Calendar,
  clock: Clock,
  'external-link': ExternalLink,
  files: Files,
  gauge: Gauge,
  logout: LogOut,
  'map-pin': MapPin,
  monitor: Monitor,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  tag: Tag,
} satisfies Record<string, Component>

/** iconfont Symbol id（不含 icon- 前缀） */
const iconfontIds = {
  add: 'add',
  close: 'close',
  delete: 'delete',
  edit: 'edit',
  languages: 'language',
  menu: 'menu',
  moon: 'moon',
  search: 'search',
  sun: 'sun',
} as const

const brandIcons = {
  github: githubSvg,
  gmail: gmailSvg,
  juejin: juejinSvg,
  wechat: wechatSvg,
} as const

type LucideName = keyof typeof lucideIcons
type IconfontName = keyof typeof iconfontIds
type BrandName = keyof typeof brandIcons
type IconName = LucideName | IconfontName | BrandName

const props = defineProps<{
  name: IconName
}>()

const kind = computed(() => {
  if (props.name in lucideIcons) return 'lucide' as const
  if (props.name in iconfontIds) return 'iconfont' as const
  return 'brand' as const
})

const lucide = computed(() => lucideIcons[props.name as LucideName])
const iconfontHref = computed(() => `#icon-${iconfontIds[props.name as IconfontName]}`)
const brandHtml = computed(() => brandIcons[props.name as BrandName] || '')
</script>

<template>
  <span class="base-icon" aria-hidden="true">
    <component
      v-if="kind === 'lucide'"
      :is="lucide"
      :stroke-width="2"
    />
    <svg v-else-if="kind === 'iconfont'" class="base-icon__svg">
      <use :href="iconfontHref" />
    </svg>
    <span
      v-else
      class="base-icon__brand"
      v-html="brandHtml"
    />
  </span>
</template>

<style scoped>
.base-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  line-height: 1;
  vertical-align: middle;
  color: currentColor;
}

.base-icon :deep(svg) {
  width: 1em;
  height: 1em;
  display: block;
}

.base-icon__svg {
  fill: currentColor;
}

.base-icon__brand {
  display: contents;
}

.base-icon__brand :deep(svg),
.base-icon__brand :deep(path) {
  fill: currentColor;
}
</style>
