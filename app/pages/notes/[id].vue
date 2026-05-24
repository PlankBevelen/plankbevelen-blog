<template>
  <div class="note-page">
    <div class="note-topbar">
      <div class="topbar-meta">
        <span class="meta-badge">{{ noteData?.article.categoryName }}</span>
        <button class="mobile-nav-trigger" @click="sidebarOpen = true">
          {{ $t('pages.notes.detail.navTrigger') }}
        </button>
      </div>
      <NuxtLink :to="localePath('/notes')" class="back-link">{{ $t('pages.notes.detail.backToList') }}</NuxtLink>
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
      <LayoutThreeColumn class="note-content-layout">
        <template #left>
          <BaseCard class="left-rail w-full">
            <LayoutNoteSidebar
              :nav-groups="noteData.navGroups"
              :active-id="noteData.article.id"
              @select="onSelectNote"
            />
          </BaseCard>
        </template>

        <template #middle>
          <LayoutNoteContent class="w-full">
            <BaseCard class="content-card p-[12px]">
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
          </LayoutNoteContent>
        </template>

        <template #right>
          <ArticleToc :content="noteData.article.content" class="right-rail w-full" />
        </template>
      </LayoutThreeColumn>
    </template>

    <div v-else class="container note-empty">
      <BaseCard>
        <el-empty :description="$t('pages.notes.detail.notFound')" />
      </BaseCard>
    </div>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="drawer-fade">
          <div v-if="sidebarOpen" class="mobile-sidebar-mask" @click="sidebarOpen = false">
            <div class="mobile-sidebar-panel" @click.stop>
              <div class="mobile-sidebar-header">
                <span>{{ $t('pages.notes.detail.mobileNav') }}</span>
                <button class="close-btn" @click="sidebarOpen = false">{{ $t('common.close') }}</button>
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
const { t } = useI18n()
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
      throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: t('pages.notes.detail.errorParam') })
    }
    const res: any = await noteService.getNote(rid, noteId.value || undefined)
    if (res?.status === 200) return res.data as NoteDetailPayload
    if (res?.status === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found', message: t('pages.notes.detail.errorNotFound') })
    }
    return null
  },
  { watch: [categoryId, noteId] }
)

const noteData = computed(() => data.value || null)
const introText = computed(() => {
  const summary = extractSummary(noteData.value?.article.content || '', 120)
  return summary || t('pages.notes.detail.defaultIntro')
})
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
  title: () => noteData.value?.article.title || t('pages.notes.detail.title'),
  description: () => introText.value,
  keywords: () => [noteData.value?.article.categoryName || ''].filter(Boolean).join(',')
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value, key: 'canonical' }]
}))
</script>

<style lang="less" scoped>

.note-page {
  min-height: 100vh - @header-height;
  padding-bottom: 100px;
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

.note-content-layout {
  position: relative;
  :deep(.content) {
    grid-template-columns: 260px minmax(0, 1fr) 220px;
    gap: 20px;
  }
}

.note-loading,
.note-empty {
  padding-top: 12px;
}

.skeleton-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 220px;
  gap: 20px;
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

</style>
