import { computed, onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

/** 骨架屏最短展示时长（毫秒），可不传覆盖 */
export const SKELETON_MIN_MS = 300

/**
 * loading 为 true 时立刻显示骨架；
 * loading 结束后若不足 minMs，则等满再隐藏，避免闪烁。
 */
export function useMinSkeleton(
  loading: MaybeRefOrGetter<boolean>,
  minMs: MaybeRefOrGetter<number> = SKELETON_MIN_MS
) {
  const showSkeleton = ref(false)
  let shownAt = 0
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  const clearHideTimer = () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  watch(
    () => Boolean(toValue(loading)),
    (isLoading) => {
      clearHideTimer()
      if (isLoading) {
        showSkeleton.value = true
        shownAt = Date.now()
        return
      }

      if (!showSkeleton.value) return

      const remain = Math.max(0, Number(toValue(minMs)) - (Date.now() - shownAt))
      if (remain === 0) {
        showSkeleton.value = false
        return
      }
      hideTimer = setTimeout(() => {
        showSkeleton.value = false
        hideTimer = null
      }, remain)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    clearHideTimer()
  })

  return {
    showSkeleton: computed(() => showSkeleton.value)
  }
}
