<template>
  <div class="note-page">
    <div class="note-topbar">
      <div class="topbar-meta">
        <span class="meta-badge">{{ currentNote?.categoryName }}</span>
        <button class="mobile-nav-trigger" type="button" :aria-expanded="sidebarOpen" @click="sidebarOpen = true">
          {{ $t('pages.notes.detail.navTrigger') }}
        </button>
      </div>
      <NuxtLink :to="localePath('/notes')" class="back-link">{{ $t('pages.notes.detail.backToList') }}</NuxtLink>
    </div>

    <template v-if="currentNote || pending">
      <LayoutThreeColumn class="note-content-layout" :loading="layoutLoading">
        <template #left>
          <div v-if="currentNote" class="left-rail">
            <BaseCard class="rail-card">
              <LayoutNoteSidebar
                :nav-groups="noteData?.navGroups || []"
                :flat-items="noteData?.flatItems || []"
                :active-id="pathNoteId"
                @select="onSelectNote"
              />
            </BaseCard>
          </div>
        </template>

        <template #middle>
          <LayoutNoteContent v-if="currentNote" class="w-full">
            <BaseCard class="content-card">
              <header class="note-heading">
                <p v-if="currentNote.chapter" class="note-chapter">{{ currentNote.chapter }}</p>
                <h1 class="note-title">{{ currentNote.title }}</h1>
              </header>
              <Suspense>
                <template #default>
                  <AsyncMdPreview
                    :modelValue="currentNote.content"
                    :theme="currentTheme"
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
          <div v-if="currentNote" class="right-rail rail-static w-full">
            <ArticleToc :content="currentNote.content" />
          </div>
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
              <BaseCard class="rail-card mobile-sidebar-card">
                <LayoutNoteSidebar
                  :nav-groups="noteData?.navGroups || []"
                  :flat-items="noteData?.flatItems || []"
                  :active-id="pathNoteId"
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
import { extractSummary, SITE_URL, SITE_AUTHOR, usePageSeo } from '@/composables/useSeo'
import noteService, { type NoteDetail } from '@/services/note.service'

definePageMeta({
  layout: 'note'
})

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
const { t, locale } = useI18n()
const currentTheme = computed(() => admin.getTheme)
const route = useRoute()
const localePath = useLocalePath()
const sidebarOpen = ref(false)

const pathNoteId = computed(() => String(route.params.id || '').trim())

if (!pathNoteId.value || Number.isNaN(Number(pathNoteId.value))) {
  await navigateTo(localePath('/notes'), { replace: true })
}

const { data, pending } = await useAsyncData(
  'note-handbook-detail',
  async () => {
    const noteId = pathNoteId.value
    if (!noteId || Number.isNaN(Number(noteId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: t('pages.notes.detail.errorParam')
      })
    }

    const res: any = await noteService.getNoteHandbook(noteId)
    if (res?.status === 200 && res.data) {
      return res.data as NoteDetail
    }
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: t('pages.notes.detail.errorNotFound')
    })
  },
  { watch: [pathNoteId] }
)

const noteData = computed(() => data.value || null)
const currentNote = computed(() => noteData.value?.note || noteData.value?.article || null)
/** 仅首次无数据时走骨架；同手册内切换保留旧内容，避免整页闪烁 */
const layoutLoading = computed(() => pending.value && !noteData.value)

const introText = computed(() => {
  const summary = extractSummary(currentNote.value?.content || '', 120)
  return summary || t('pages.notes.detail.defaultIntro')
})

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  }
)

function onSelectNote(_groupId: string, itemId: string) {
  if (!itemId || itemId === pathNoteId.value) return
  navigateTo({
    path: localePath(`/notes/${itemId}`)
  })
}

function onSelectNoteFromDrawer(groupId: string, itemId: string) {
  sidebarOpen.value = false
  onSelectNote(groupId, itemId)
}

const canonicalUrl = computed(() => {
  return `${SITE_URL}/notes/${pathNoteId.value}`
})

usePageSeo({
  title: () => currentNote.value?.title || t('pages.notes.detail.title'),
  description: () => introText.value,
  keywords: () => [currentNote.value?.categoryName || ''].filter(Boolean).join(',')
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value, key: 'canonical' }],
  script: [
    {
      key: 'note-ld',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        url: canonicalUrl.value,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl.value },
        headline: currentNote.value?.title,
        description: introText.value,
        inLanguage: locale.value === 'en' ? 'en' : 'zh-CN',
        author: [{ '@type': 'Person', name: SITE_AUTHOR, url: SITE_URL }],
        publisher: { '@type': 'Person', name: SITE_AUTHOR, url: SITE_URL },
      }),
    },
  ],
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
  gap: @space-2xl;
  padding-top: 22px;
  padding-bottom: 18px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: @space-xs;
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
  gap: @space-lg;
}

.meta-badge {
  padding: 7px @space-lg;
  border-radius: @radius-pill;
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  color: var(--primary-color);
  font-size: @font-size-xs;
}

.mobile-nav-trigger {
  display: none;
  border: 1px solid var(--border-color);
  background: var(--card-color);
  color: var(--text-color);
  border-radius: @radius-pill;
  padding: 7px @space-lg;
  font-size: @font-size-xs;
}

.note-heading {
  margin-bottom: 18px;
  padding-bottom: @space-xl;
  border-bottom: 1px solid var(--border-color);
}

.note-chapter {
  margin: 0;
  font-size: @font-size-xs;
  color: var(--primary-color);
}

.note-title {
  margin: @space-base 0 0;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.25;
  color: var(--text-color);
  font-weight: 600;
}

.note-content-layout {
  position: relative;
  :deep(.content) {
    grid-template-columns: 260px minmax(0, 1fr) 220px;
    gap: @space-3xl;
  }
}

.rail-card {
  width: 100%;
  border-radius: @small-border-radius;
  border: 1px solid var(--border-color);
  background-color: var(--card-color);
  box-shadow: @shadow-card;

  :deep(.card-content) {
    padding: @space-2xl @space-4xl;
  }

  &:hover {
    transform: none;
    box-shadow: @shadow-card;
  }
}

.rail-static {
  width: 100%;

  :deep(.card) {
    border-radius: @small-border-radius;
    border: 1px solid var(--border-color);
    background-color: var(--card-color);
    box-shadow: @shadow-card;

    &:hover {
      transform: none;
      box-shadow: @shadow-card;
    }
  }

  :deep(.card-content) {
    padding: @space-2xl @space-4xl;
  }

  :deep(.card-header) {
    padding: @space-2xl @space-4xl;
  }
}

.left-rail {
  position: sticky;
  top: var(--layout-sticky-top);
  width: 100%;

  .rail-card {
    max-height: calc(100vh - @header-height - 40px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--tertiary-color) transparent;
  }
}

.content-card {
  border-radius: @small-border-radius;
  box-shadow: @shadow-card;

  &:hover {
    transform: none;
    box-shadow: @shadow-card;
  }
}

.note-loading,
.note-empty {
  padding-top: @space-lg;
}

.mobile-sidebar-mask {
  position: fixed;
  inset: 0;
  z-index: @z-mask;
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
  margin-bottom: @space-xl;
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
  border-radius: @small-border-radius;
  border: 1px solid var(--border-color);
  box-shadow: @shadow-card;

  :deep(.card-content) {
    padding: @space-2xl @space-4xl;
  }

  &:hover {
    transform: none;
    box-shadow: @shadow-card;
  }
}

@media (max-width: @screen-tablet) {
  .mobile-nav-trigger {
    display: inline-flex;
  }
}
</style>
