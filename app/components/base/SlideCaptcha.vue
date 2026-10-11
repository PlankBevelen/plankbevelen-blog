<template>
  <div class="slide-captcha" :style="{ width: panelWidth + 'px' }">
    <div class="slide-captcha__panel" :style="{ height: panelHeight + 'px' }">
      <img v-if="bgImage" class="slide-captcha__bg" :src="bgImage" alt="" draggable="false" />
      <div v-else class="slide-captcha__placeholder">{{ placeholderText }}</div>
      <img
        v-if="pieceImage"
        class="slide-captcha__piece"
        :src="pieceImage"
        alt=""
        draggable="false"
        :style="{
          width: pieceSize + 'px',
          height: pieceSize + 'px',
          top: pieceY + 'px',
          left: offsetX + 'px',
        }"
      />
      <button type="button" class="slide-captcha__refresh" :title="refreshTitle" @click="onRefresh">
        ↻
      </button>
    </div>

    <div
      class="slide-captcha__track"
      :class="{ 'is-dragging': dragging, 'is-done': moved }"
      @pointerdown="onPointerDown"
    >
      <div class="slide-captcha__fill" :style="{ width: Math.max(offsetX, 0) + 'px' }" />
      <div
        class="slide-captcha__thumb"
        :style="{ transform: `translateX(${offsetX}px)` }"
      />
      <span v-if="!moved" class="slide-captcha__hint">{{ hintText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    bgImage?: string
    pieceImage?: string
    pieceY?: number
    pieceSize?: number
    width?: number
    height?: number
    modelValue?: string
    hintText?: string
    refreshTitle?: string
    placeholderText?: string
  }>(),
  {
    bgImage: '',
    pieceImage: '',
    pieceY: 40,
    pieceSize: 42,
    width: 280,
    height: 140,
    modelValue: '',
    hintText: '拖动滑块完成拼图',
    refreshTitle: '刷新验证码',
    placeholderText: '加载中…',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  refresh: []
}>()

const offsetX = ref(0)
const dragging = ref(false)
const moved = ref(false)
const startClientX = ref(0)
const startOffset = ref(0)

const panelWidth = computed(() => props.width || 280)
const panelHeight = computed(() => props.height || 140)
const maxOffset = computed(() => Math.max(0, panelWidth.value - (props.pieceSize || 42)))

watch(
  () => [props.bgImage, props.pieceImage] as const,
  () => {
    offsetX.value = 0
    moved.value = false
    emit('update:modelValue', '')
  }
)

// 外部清空 modelValue 时复位滑块
watch(
  () => props.modelValue,
  (v) => {
    if (!v) {
      offsetX.value = 0
      moved.value = false
    }
  }
)

function clamp(n: number) {
  return Math.min(maxOffset.value, Math.max(0, n))
}

function onPointerDown(e: PointerEvent) {
  if (!props.bgImage) return
  dragging.value = true
  startClientX.value = e.clientX
  startOffset.value = offsetX.value
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const next = clamp(startOffset.value + (e.clientX - startClientX.value))
  offsetX.value = next
  if (next > 2) moved.value = true
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  const value = String(Math.round(offsetX.value))
  emit('update:modelValue', moved.value ? value : '')
}

function onRefresh() {
  offsetX.value = 0
  moved.value = false
  emit('update:modelValue', '')
  emit('refresh')
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})
</script>

<style scoped lang="less">
.slide-captcha {
  user-select: none;
  touch-action: none;
}

.slide-captcha__panel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: @base-border-radius;
  border: 1px solid var(--border-color);
  background: var(--card-color);
}

.slide-captcha__bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.slide-captcha__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: @font-size-sm;
  color: var(--secondary-color);
}

.slide-captcha__piece {
  position: absolute;
  left: 0;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--text-color) 25%, transparent);
  border-radius: 4px;
  pointer-events: none;
}

.slide-captcha__refresh {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: @base-border-radius;
  background: color-mix(in srgb, var(--card-color) 88%, transparent);
  color: var(--text-color);
  cursor: pointer;
  line-height: 1;
}

.slide-captcha__track {
  position: relative;
  margin-top: @space-md;
  height: 40px;
  border-radius: @base-border-radius;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--primary-color) 6%, var(--card-color));
  overflow: hidden;
  cursor: pointer;

  &.is-dragging,
  &.is-done {
    border-color: color-mix(in srgb, var(--primary-color) 55%, var(--border-color));
  }
}

.slide-captcha__fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: color-mix(in srgb, var(--primary-color) 22%, transparent);
}

.slide-captcha__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 34px;
  height: 34px;
  border-radius: calc(@base-border-radius - 2px);
  background: var(--primary-color);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--text-color) 18%, transparent);
  z-index: 1;

  &::after {
    content: '❯';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
  }
}

.slide-captcha__hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: @font-size-xs;
  color: var(--secondary-color);
  pointer-events: none;
  padding-left: 36px;
}
</style>
