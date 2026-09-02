<template>
  <div class="skeleton-gate">
    <div v-if="showSkeleton" class="skeleton-gate__skeleton">
      <slot name="skeleton">
        <el-skeleton animated :rows="rows" />
      </slot>
    </div>
    <div v-show="!showSkeleton" class="skeleton-gate__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { SKELETON_MIN_MS, useMinSkeleton } from '@/composables/useMinSkeleton'

const props = withDefaults(
  defineProps<{
    loading: boolean
    minMs?: number
    rows?: number
  }>(),
  {
    minMs: SKELETON_MIN_MS,
    rows: 5
  }
)

const { showSkeleton } = useMinSkeleton(
  toRef(props, 'loading'),
  toRef(props, 'minMs')
)
</script>

<style scoped lang="less">
.skeleton-gate__content {
  display: contents;
}
</style>
