<template>
  <div class="turnstile">
    <div v-show="!ready && siteKey" class="turnstile__skeleton" aria-hidden="true" />
    <div ref="hostRef" class="turnstile__host" :class="{ 'is-ready': ready }" />
    <p v-if="!siteKey" class="turnstile__hint">未配置 Turnstile Site Key</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  siteKey: string
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  error: []
}>()

const hostRef = ref<HTMLElement | null>(null)
const widgetId = ref<string | number | null>(null)
const ready = ref(false)
let scriptPromise: Promise<void> | null = null

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string | number
      reset: (id?: string | number) => void
      remove: (id?: string | number) => void
    }
  }
}

function loadScript(): Promise<void> {
  if (import.meta.server) return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
    if (existing) {
      if (window.turnstile || existing.dataset.loaded === '1') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('turnstile load failed')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.dataset.turnstile = '1'
    script.onload = () => {
      script.dataset.loaded = '1'
      resolve()
    }
    script.onerror = () => reject(new Error('turnstile load failed'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

async function mountWidget() {
  if (!import.meta.client || !hostRef.value || !props.siteKey) return
  ready.value = false

  try {
    await loadScript()
  } catch {
    return
  }
  if (!window.turnstile || !hostRef.value) return

  if (widgetId.value !== null) {
    try {
      window.turnstile.remove(widgetId.value)
    } catch {
      // ignore
    }
    widgetId.value = null
    hostRef.value.innerHTML = ''
  }

  widgetId.value = window.turnstile.render(hostRef.value, {
    sitekey: props.siteKey,
    size: 'flexible',
    callback: (token: string) => {
      ready.value = true
      emit('update:modelValue', token || '')
    },
    'expired-callback': () => emit('update:modelValue', ''),
    'error-callback': () => {
      emit('update:modelValue', '')
      emit('error')
    },
  })
  // iframe 插入后即可隐藏骨架（不必等用户完成验证）
  ready.value = true
}

function reset() {
  emit('update:modelValue', '')
  if (widgetId.value !== null && window.turnstile) {
    window.turnstile.reset(widgetId.value)
  } else {
    void mountWidget()
  }
}

defineExpose({ reset })

// setup 阶段就开始拉脚本，别等到 onMounted
if (import.meta.client) {
  void loadScript()
}

onMounted(() => {
  void mountWidget()
})

watch(
  () => props.siteKey,
  () => {
    void mountWidget()
  }
)

onBeforeUnmount(() => {
  if (widgetId.value !== null && window.turnstile) {
    try {
      window.turnstile.remove(widgetId.value)
    } catch {
      // ignore
    }
  }
})
</script>

<style scoped lang="less">
.turnstile {
  position: relative;
  width: 100%;
  min-height: 65px;
}

.turnstile__skeleton {
  width: 100%;
  height: 65px;
  border-radius: @small-border-radius;
  border: 1px solid var(--border-color);
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--mute-bg-color) 80%, transparent) 25%,
    color-mix(in srgb, var(--border-color) 55%, transparent) 50%,
    color-mix(in srgb, var(--mute-bg-color) 80%, transparent) 75%
  );
  background-size: 200% 100%;
  animation: turnstile-shimmer 1.2s ease-in-out infinite;
}

.turnstile__host {
  width: 100%;
  min-height: 0;

  &.is-ready {
    min-height: 65px;
  }
}

.turnstile__hint {
  margin: 0;
  font-size: @font-size-xs;
  color: var(--secondary-color);
}

@keyframes turnstile-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
