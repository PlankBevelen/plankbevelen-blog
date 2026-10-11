<template>
  <BaseCard class="page-intro">
    <div class="header">
      <h1 class="title">{{ props.title }}</h1>
    </div>
    <Suspense v-if="props.content">
      <template #default>
        <AsyncMdPreview :modelValue="props.content" :theme="currentTheme" previewOnly />
      </template>
      <template #fallback>
        <el-skeleton :rows="4" animated />
      </template>
    </Suspense>
    <el-empty v-else :description="props.emptyText" />
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue'
import { useAdminStore } from '@/stores/admin.store'

const props = withDefaults(defineProps<{
  title: string
  content: string
  emptyText?: string
}>(), {
  emptyText: '暂无页面内容'
})

const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)

const mdPreviewLoaders = globalThis as typeof globalThis & {
  __md_preview_loader?: Promise<Component>
}
const AsyncMdPreview = defineAsyncComponent(() => {
  if (!mdPreviewLoaders.__md_preview_loader) {
    mdPreviewLoaders.__md_preview_loader = (async () => {
      const mod = await import('md-editor-v3')
      await import('md-editor-v3/lib/style.css')
      return (mod.MdPreview || mod) as Component
    })()
  }
  return mdPreviewLoaders.__md_preview_loader
})
</script>

<style scoped lang="less">
.page-intro {
  overflow: hidden;
}

.header {
  margin-bottom: @space-xl;
}

.kicker {
  margin: 0 0 @space-xs;
  font-size: @font-size-xs;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.title {
  margin: @space-lg 0 0 0;
  font-size: @font-size-xxl;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}
</style>
