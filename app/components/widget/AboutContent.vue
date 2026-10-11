<template>
  <BaseCard class="about-content">
    <h1 class="title">{{ $t('pages.about.title') }}</h1>
    <Suspense v-if="aboutMd">
      <template #default>
        <AsyncMdPreview :modelValue="aboutMd" :theme="currentTheme" />
      </template>
      <template #fallback>
        <el-skeleton :rows="6" animated />
      </template>
    </Suspense>
    <el-empty v-else description="暂无关于内容" />
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue'
import { useAdminStore } from '@/stores/admin.store'

defineProps<{
  aboutMd: string
}>()

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
.about-content {
  overflow: hidden;
}

.title {
  margin: 0;
  font-size: @font-size-xxl;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}
</style>
