<script setup lang="ts">
import githubSvg from '~/assets/icons/github.svg?raw'
import gmailSvg from '~/assets/icons/gmail.svg?raw'
import juejinSvg from '~/assets/icons/juejin.svg?raw'
import wechatSvg from '~/assets/icons/wechat.svg?raw'

/** iconfont Symbol id（不含 icon- 前缀） */
const iconfontIds = {
  add: 'add',
  briefcase: 'briefcase',
  calendar: 'calendar',
  clock: 'clock',
  close: 'close',
  delete: 'delete',
  edit: 'edit',
  'external-link': 'external-link',
  files: 'files',
  languages: 'language',
  logout: 'logout',
  'map-pin': 'map-pin',
  menu: 'menu',
  monitor: 'monitoring',
  moon: 'moon',
  'panel-left-close': 'panel-left-close',
  'panel-left-open': 'panel-left-open',
  search: 'search',
  sun: 'sun',
  tag: 'tag',
} as const

const brandIcons = {
  github: githubSvg,
  gmail: gmailSvg,
  juejin: juejinSvg,
  wechat: wechatSvg,
} as const

type IconfontName = keyof typeof iconfontIds
type BrandName = keyof typeof brandIcons
type IconName = IconfontName | BrandName

const props = defineProps<{
  name: IconName
}>()

const kind = computed(() => {
  if (props.name in iconfontIds) return 'iconfont' as const
  return 'brand' as const
})

const iconfontHref = computed(() => `#icon-${iconfontIds[props.name as IconfontName]}`)
const brandHtml = computed(() => brandIcons[props.name as BrandName] || '')
</script>

<template>
  <span class="base-icon" aria-hidden="true">
    <svg v-if="kind === 'iconfont'" class="base-icon__svg">
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
