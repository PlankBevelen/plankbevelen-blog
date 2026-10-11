<template>
  <div class="admin-page-header">
    <div class="admin-page-header__copy">
      <h2 class="admin-page-header__title">{{ title }}</h2>
      <p v-if="description || $slots.description" class="admin-page-header__desc">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="admin-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped lang="less">
.admin-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: @space-2xl;
  margin-bottom: @space-2xl;
}

.admin-page-header__copy {
  min-width: 0;
}

.admin-page-header__title {
  margin: 0;
  font-size: @font-size-xl;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-color);
}

.admin-page-header__desc {
  margin: @space-2xs 0 0;
  font-size: @font-size-sm;
  line-height: 1.6;
  color: var(--secondary-color);
  max-width: 40rem;
}

.admin-page-header__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-base;
}
</style>
