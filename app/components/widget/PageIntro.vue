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
        <el-skeleton rows="4" animated />
      </template>
    </Suspense>
    <el-empty v-else :description="props.emptyText" />
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
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

const AsyncMdPreview = defineAsyncComponent(() => {
  const key = '__md_preview_loader'
  if (!(globalThis as any)[key]) {
    ;(globalThis as any)[key] = (async () => {
      const mod = await import('md-editor-v3')
      await import('md-editor-v3/lib/style.css')
      return mod.MdPreview || mod.default?.MdPreview || mod
    })()
  }
  return (globalThis as any)[key]
})
</script>

<style scoped lang="less">
.page-intro {
  overflow: hidden;
}

.header {
  margin-bottom: 14px;
}

.kicker {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.title {
  margin: 12px 0 0 0;
  font-size: @font-size-xxl;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}
</style>
