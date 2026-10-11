<template>
  <section class="admin-panel">
    <div v-if="title || $slots.header || $slots.extra" class="admin-panel__header">
      <div class="admin-panel__header-main">
        <slot name="header">
          <span v-if="title" class="admin-panel__title">{{ title }}</span>
        </slot>
      </div>
      <div v-if="$slots.extra" class="admin-panel__extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="admin-panel__body" :class="{ padded: padded && !flush, flush }">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    /** body 内边距；表格场景可关 */
    padded?: boolean
    /** 无内边距（表格贴边） */
    flush?: boolean
  }>(),
  {
    padded: true,
    flush: false
  }
)
</script>

<style scoped lang="less">
.admin-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: @small-border-radius;
  background: var(--card-color);
}

.admin-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-lg;
  min-height: 44px;
  padding: 0 @space-2xl;
  border-bottom: 1px solid var(--border-color);
}

.admin-panel__header-main {
  min-width: 0;
  font-size: @font-size-sm;
  font-weight: 600;
  color: var(--text-color);
}

.admin-panel__title {
  line-height: 1.4;
}

.admin-panel__extra {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: @space-base;
}

.admin-panel__body {
  min-width: 0;

  &.padded {
    padding: @space-2xl;
  }

  &.flush {
    padding: 0;
  }
}
</style>
