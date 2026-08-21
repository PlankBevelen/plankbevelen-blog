<template>
  <nav v-if="total > 0" class="base-pagination" aria-label="pagination">
    <p v-if="showTotal" class="total">{{ totalText }}</p>

    <div v-if="totalPages > 1" class="controls">
      <button
        type="button"
        class="nav-btn"
        :disabled="page <= 1"
        @click="emitPage(page - 1)"
      >
        {{ $t('pagination.prev') }}
      </button>

      <div class="pages">
        <template v-for="(item, index) in visiblePages" :key="`${item}-${index}`">
          <span v-if="item === 'ellipsis'" class="ellipsis">…</span>
          <button
            v-else
            type="button"
            class="page-btn"
            :class="{ active: item === page }"
            :aria-current="item === page ? 'page' : undefined"
            @click="emitPage(item)"
          >
            {{ item }}
          </button>
        </template>
      </div>

      <button
        type="button"
        class="nav-btn"
        :disabled="page >= totalPages"
        @click="emitPage(page + 1)"
      >
        {{ $t('pagination.next') }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    total: number
    page: number
    pageSize?: number
    showTotal?: boolean
  }>(),
  {
    pageSize: 10,
    showTotal: true,
  },
)

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const { t } = useI18n()

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize)),
)

const totalText = computed(() =>
  t('pagination.total', { total: props.total }),
)

const visiblePages = computed(() => {
  const current = props.page
  const total = totalPages.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages: Array<number | 'ellipsis'> = [1]
  const windowStart = Math.max(2, current - 1)
  const windowEnd = Math.min(total - 1, current + 1)

  if (windowStart > 2) {
    pages.push('ellipsis')
  }

  for (let i = windowStart; i <= windowEnd; i += 1) {
    pages.push(i)
  }

  if (windowEnd < total - 1) {
    pages.push('ellipsis')
  }

  pages.push(total)
  return pages
})

const emitPage = (nextPage: number) => {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === props.page) {
    return
  }
  emit('page-change', nextPage)
}
</script>

<style scoped lang="less">
.base-pagination {
  padding-top: @space-3xl;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: @space-2xl;
}

.total {
  margin: 0;
  font-size: @font-size-sm;
  color: var(--secondary-color);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: @space-lg;
}

.pages {
  display: flex;
  align-items: center;
  gap: @space-xs;
}

.nav-btn,
.page-btn {
  border: 1px solid var(--border-color);
  background: var(--card-color);
  border-radius: @small-border-radius;
  font-size: @font-size-sm;
  line-height: 1;
  color: var(--text-color);
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.nav-btn {
  padding: @space-base @space-xl;

  &:hover:not(:disabled) {
    color: var(--primary-color);
    border-color: var(--primary-color);
    background: var(--shallow-active-bg-color);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 @space-base;

  &:hover:not(.active) {
    color: var(--primary-color);
    border-color: var(--primary-color);
    background: var(--shallow-active-bg-color);
  }

  &.active {
    color: #fff;
    border-color: var(--primary-color);
    background: var(--primary-color);
    cursor: default;
  }
}

.ellipsis {
  min-width: 24px;
  text-align: center;
  font-size: @font-size-sm;
  color: var(--tertiary-color);
  user-select: none;
}
</style>
