<template>
  <div class="note-detail-page">
    <div class="note-topbar">
      <div class="topbar-meta">
        <span class="meta-badge">{{ noteData?.article.categoryName }}</span>
        <button class="mobile-nav-trigger" @click="sidebarOpen = true">
          目录导航
        </button>
      </div>
      <NuxtLink :to="localePath('/notes')" class="back-link">返回笔记</NuxtLink>
    </div>

    <div v-if="pending" class="note-loading">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-layout">
            <div class="skeleton-block sidebar"></div>
            <div class="skeleton-block content"></div>
            <div class="skeleton-block toc"></div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <template v-else-if="noteData">
      <LayoutThreeColumn class="note-shell">
        <template #left>
          <aside class="left-rail">
            <BaseCard class="rail-card">
              <LayoutNoteSidebar
                :nav-groups="noteData.navGroups"
                :active-id="noteData.article.id"
                @select="onSelectNote"
              />
            </BaseCard>
          </aside>
        </template>

        <template #middle>
          <LayoutNoteContent class="center-content">
          <article class="space-y-3">
            <BaseCard class="hero-card">
              <h1 class="hero-title">{{ noteData.article.title }}</h1>
              <p class="hero-summary">
                {{ introText }}
              </p>
              <div class="hero-info">
                <span>分类：{{ noteData.article.categoryName }}</span>
                <span>章节：{{ noteData.article.chapter }}</span>
                <span>更新于：{{ timeText }}</span>
                <span>本分类 {{ noteData.siblingNotes.length }} 篇</span>
              </div>
            </BaseCard>
            <BaseCard class="content-card">
              <Suspense>
                <template #default>
                  <AsyncMdPreview
                    :modelValue="noteData.article.content"
                    :theme="currentTheme"
                    :noMermaid="true"
                    :noKatex="true"
                  />
                </template>
                <template #fallback>
                  <el-skeleton :rows="12" animated />
                </template>
              </Suspense>
            </BaseCard>
          </article>
          </LayoutNoteContent>
        </template>

        <template #right>
          <aside class="right-rail">
            <ArticleToc :content="noteData.article.content" />
          </aside>
        </template>
      </LayoutThreeColumn>
    </template>

    <div v-else class="container note-empty">
      <BaseCard>
        <el-empty description="没有找到这篇笔记" />
      </BaseCard>
    </div>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="drawer-fade">
          <div v-if="sidebarOpen" class="mobile-sidebar-mask" @click="sidebarOpen = false">
            <div class="mobile-sidebar-panel" @click.stop>
              <div class="mobile-sidebar-header">
                <span>导航</span>
                <button class="close-btn" @click="sidebarOpen = false">关闭</button>
              </div>
              <BaseCard class="mobile-sidebar-card">
                <LayoutNoteSidebar
                  :nav-groups="noteData?.navGroups || []"
                  :active-id="noteData?.article.id || ''"
                  @select="onSelectNoteFromDrawer"
                />
              </BaseCard>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { createError, navigateTo, useAsyncData } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin.store'
import { extractSummary, SITE_URL, usePageSeo } from '@/composables/useSeo'
import { formatDateTime } from '@/utils/format'
import noteService from '@/services/note.service'

definePageMeta({
  layout: 'note'
})

type NoteSidebarItem = {
  id: string
  title: string
}

type NoteSidebarGroup = {
  id: string
  title: string
  count: number
  items: NoteSidebarItem[]
}

type NoteDetailPayload = {
  article: {
    id: string
    title: string
    category: string
    categoryName: string
    chapter: string
    content: string
    createTime: string
    updateTime: string
  }
  navGroups: NoteSidebarGroup[]
  currentGroupId: string
  siblingNotes: NoteSidebarItem[]
}

const AsyncMdPreview = defineAsyncComponent(() => {
  const key = '__notes_md_preview_loader'
  if (!(globalThis as any)[key]) {
    ;(globalThis as any)[key] = (async () => {
      const mod: any = await import('md-editor-v3')
      await import('md-editor-v3/lib/style.css')
      return mod.MdPreview || mod.default?.MdPreview || mod
    })()
  }
  return (globalThis as any)[key]
})

const admin = useAdminStore()
const currentTheme = computed(() => admin.getTheme)
const route = useRoute()
const localePath = useLocalePath()
const sidebarOpen = ref(false)

const categoryId = computed(() => String(route.params.id || ''))
const noteId = computed(() => String(route.query.noteId || ''))
if (!categoryId.value) {
  await navigateTo('/notes', { replace: true })
}

const { data, pending } = await useAsyncData(
  'note-detail',
  async () => {
    const rid = categoryId.value
    if (!rid) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: '参数错误' })
    }
    const res: any = await noteService.getNote(rid, noteId.value || undefined)
    if (res?.status === 200) return res.data as NoteDetailPayload
    if (res?.status === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found', message: '笔记不存在' })
    }
    return null
  },
  { watch: [categoryId, noteId] }
)

const noteData = computed(() => data.value || null)
const introText = computed(() => {
  const summary = extractSummary(noteData.value?.article.content || '', 120)
  return summary || '这是该分类下默认展示的第一篇笔记，适合作为查阅入口。'
})
const timeText = computed(() =>
  formatDateTime(noteData.value?.article.updateTime || noteData.value?.article.createTime || '')
)

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  }
)

function onSelectNote(_groupId: string, itemId: string) {
  if (!itemId || itemId === noteData.value?.article.id) return
  navigateTo({
    path: localePath(`/notes/${categoryId.value}`),
    query: { noteId: itemId }
  })
}

function onSelectNoteFromDrawer(groupId: string, itemId: string) {
  sidebarOpen.value = false
  onSelectNote(groupId, itemId)
}

const canonicalUrl = computed(() => {
  const suffix = noteId.value ? `?noteId=${noteId.value}` : ''
  return `${SITE_URL}/notes/${categoryId.value}${suffix}`
})

usePageSeo({
  title: () => noteData.value?.article.title || '笔记',
  description: () => introText.value,
  keywords: () => [noteData.value?.article.categoryName || ''].filter(Boolean).join(',')
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value, key: 'canonical' }]
}))
</script>

<style lang="less" scoped>
.note-detail-page {
  min-height: 100vh;
  padding-bottom: 48px;
}

.note-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 22px;
  padding-bottom: 18px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--secondary-color);
  text-decoration: none;
  font-size: @font-size-sm;

  &:hover {
    color: var(--primary-color);
  }
}

.topbar-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-badge {
  padding: 7px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  color: var(--primary-color);
  font-size: @font-size-xs;
}

.mobile-nav-trigger {
  display: none;
  border: 1px solid var(--border-color);
  background: var(--card-color);
  color: var(--text-color);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: @font-size-xs;
}

.note-shell {
  :deep(.content) {
    grid-template-columns: 280px minmax(0, 1fr) 250px !important;
    gap: 24px !important;
    align-items: start;
  }

  :deep(.left .slot-wrapper > *),
  :deep(.middle .slot-wrapper > *),
  :deep(.right .slot-wrapper > *) {
    animation: none;
  }
}

.left-rail,
.right-rail {
  position: sticky;
  top: calc(@header-height + 20px);
}

.rail-card {
  overflow: hidden;

  :deep(.card-content) {
    padding: 0;
  }
}

.center-content {
  width: 100%;
}


.hero-card {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 7%, transparent), transparent 40%),
    color-mix(in srgb, var(--card-color) 86%, white 14%);
  padding: 12px;
}

.separator {
  opacity: 0.6;
}

.hero-title {
  font-size: 42px;
  line-height: 1.18;
  color: var(--text-color);
}

.hero-summary {
  margin-top: 12px;
  max-width: 68ch;
  font-size: @font-size-md;
  line-height: 1.9;
  color: var(--secondary-color);
}

.hero-info {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  color: var(--secondary-color);
  font-size: @font-size-sm;
}

.content-card {
  // padding: 24px 32px 30px;
  padding: 12px;
  :deep(.md-editor-preview) {
    background: transparent;
  }

  :deep(.md-editor-preview h1),
  :deep(.md-editor-preview h2),
  :deep(.md-editor-preview h3) {
    scroll-margin-top: calc(@header-height + 28px);
  }
}

.toc-title,
.group-title {
  padding: 0 20px 14px;
  font-size: @font-size-md;
  color: var(--text-color);
}

.toc-panel {
  :deep(.toc-card) {
    position: static;
    top: auto;
    max-height: none;
    border: none;
    box-shadow: none;
    background: transparent;
  }

  :deep(.card-header) {
    display: none;
  }

  :deep(.card-content) {
    padding: 0 14px 0 20px;
  }
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 14px 0 20px;
}

.group-link {
  display: block;
  padding: 9px 10px;
  border-radius: @small-border-radius;
  text-decoration: none;
  color: var(--secondary-color);
  font-size: @font-size-sm;
  line-height: 1.5;

  &:hover,
  &.active {
    background: color-mix(in srgb, var(--primary-color) 9%, transparent);
    color: var(--primary-color);
  }
}

.note-loading,
.note-empty {
  padding-top: 12px;
}

.skeleton-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 250px;
  gap: 24px;
}

.skeleton-block {
  border-radius: @large-border-radius;
  background: var(--card-color);
  border: 1px solid var(--border-color);

  &.sidebar {
    min-height: 640px;
  }

  &.content {
    min-height: 980px;
  }

  &.toc {
    min-height: 420px;
  }
}

.mobile-sidebar-mask {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(15, 23, 42, 0.32);
  display: flex;
  justify-content: flex-start;
}

.mobile-sidebar-panel {
  width: min(86vw, 360px);
  height: 100%;
  background: var(--bg-color);
  padding: 18px;
  overflow-y: auto;
}

.mobile-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: @font-size-md;
  color: var(--text-color);
}

.close-btn {
  border: none;
  background: transparent;
  color: var(--secondary-color);
  font-size: @font-size-sm;
}

.mobile-sidebar-card {
  overflow: hidden;

  :deep(.card-content) {
    padding: 0;
  }
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .note-shell :deep(.content),
  .skeleton-layout {
    grid-template-columns: 260px minmax(0, 1fr) !important;
  }

  .note-shell :deep(.right),
  .right-rail,
  .skeleton-block.toc {
    display: none;
  }
}

@media (max-width: 960px) {
  .note-topbar {
    padding-top: 18px;
  }

  .note-shell :deep(.content),
  .skeleton-layout {
    grid-template-columns: 1fr !important;
  }

  .note-shell :deep(.left),
  .left-rail,
  .skeleton-block.sidebar {
    display: none;
  }

  .mobile-nav-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .hero-card {
    padding: 24px 20px;
  }

  .hero-title {
    font-size: 30px;
  }

  .content-card {
    padding: 18px 16px 24px;
  }

}
</style>
