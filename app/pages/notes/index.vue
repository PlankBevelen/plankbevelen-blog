<template>
  <div class="notes-page">
    <div class="container">
      <LayoutTwoColumn :loading="pending">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <WidgetRecordLink />
        </template>

        <template #right>
          <div class="notes-grid">
            <BaseCard
              v-for="item in categories"
              :key="item.id"
              class="note-card"
              @click="openCategory(item)"
            >
              <div class="note-card-top">
                <h3 class="note-title">{{ item.name }}</h3>
                <span class="note-count">{{ $t('pages.notes.countUnit', { count: item.count || 0 }) }}</span>
              </div>
              <p class="note-summary">
                {{ getCategorySummary(item) }}
              </p>
              <div class="note-meta">
                <time class="note-time">
                  {{ formatDateTime(item.updateTime || item.createTime || '') }}
                </time>
              </div>
            </BaseCard>
          </div>

          <div v-if="!pending && !categories.length" class="notes-empty">
            <el-empty :description="$t('pages.notes.empty')" />
          </div>
        </template>
      </LayoutTwoColumn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatDateTime } from '@/utils/format'
import { useSidebarData } from '@/composables/useSidebarData'
import noteService, { type NoteCategory } from '@/services/note.service'

const { t } = useI18n()
const localePath = useLocalePath()

const { data: sidebarData } = await useSidebarData()
const stats = computed(() => sidebarData.value?.stats || null)

const categories = ref<NoteCategory[]>([])
const pending = ref(false)

function getCategorySummary(item: NoteCategory) {
  const count = Number(item.count || 0)
  if (count <= 0) {
    return t('pages.notes.categoryEmpty', { name: item.name, count })
  }
  if (item.firstNoteTitle) {
    return t('pages.notes.categoryFirstNote', {
      title: item.firstNoteTitle,
      count
    })
  }
  return t('pages.notes.categorySummary', { name: item.name, count })
}

async function loadData() {
  pending.value = true
  try {
    const res: any = await noteService.getNoteCategories()
    if (res?.status === 200) {
      categories.value = res.data || []
      return
    }
    categories.value = []
  } finally {
    pending.value = false
  }
}

async function openCategory(item: NoteCategory) {
  const firstNoteId = String(item.firstNoteId || '').trim()
  if (firstNoteId) {
    navigateTo(localePath(`/notes/${firstNoteId}`))
    return
  }
  const { ElMessage } = await import('element-plus')
  ElMessage.info(t('pages.notes.categoryEmpty', { name: item.name, count: 0 }))
}

await loadData()

usePageSeo({
  title: () => t('pages.notes.title'),
  description: () => t('pages.notes.meta.description')
})
</script>

<style lang="less" scoped>
.notes-page {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: 34px;
    padding-bottom: 40px;
  }
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.note-card {
  cursor: pointer;
  border: 1px solid var(--border-color);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: color-mix(in srgb, var(--primary-color) 30%, var(--border-color));
    box-shadow: 0 14px 24px rgba(2, 132, 199, 0.08);
  }
}

.note-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.note-count {
  font-size: @font-size-xs;
  color: var(--tertiary-color);
}

.note-title {
  margin: 6px 0 0;
  font-size: @font-size-lg;
  line-height: 1.45;
  color: var(--text-color);
}

.note-summary {
  margin: 10px 0 0;
  color: var(--secondary-color);
  line-height: 1.85;
  font-size: @font-size-sm;
  min-height: 78px;
}

.note-meta {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.note-time {
  font-size: @font-size-xs;
  color: var(--tertiary-color);
}

.notes-empty {
  padding: 36px 0 12px;
}

@media (max-width: 960px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
