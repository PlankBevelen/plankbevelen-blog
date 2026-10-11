<template>
  <div class="admin-stat-strip">
    <component
      :is="isInteractive(item) ? 'button' : 'div'"
      v-for="item in items"
      :key="item.key"
      class="admin-stat-strip__item"
      :class="{ clickable: isInteractive(item) }"
      :type="isInteractive(item) ? 'button' : undefined"
      @click="onItemClick(item)"
    >
      <p class="admin-stat-strip__label">{{ item.label }}</p>
      <p class="admin-stat-strip__value">{{ item.value }}</p>
      <p v-if="item.desc" class="admin-stat-strip__desc">{{ item.desc }}</p>
    </component>
  </div>
</template>

<script setup lang="ts">
export type StatStripItem = {
  key: string
  label: string
  value: string | number
  desc?: string
  to?: string
  onClick?: () => void
}

defineProps<{
  items: StatStripItem[]
}>()

const isInteractive = (item: StatStripItem) => !!(item.to || item.onClick)

const onItemClick = (item: StatStripItem) => {
  if (!isInteractive(item)) return
  if (item.onClick) {
    item.onClick()
    return
  }
  if (item.to) {
    navigateTo(item.to)
  }
}
</script>

<style scoped lang="less">
.admin-stat-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1px;
  margin-bottom: @space-2xl;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: @small-border-radius;
  background: var(--border-color);
}

.admin-stat-strip__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: @space-2xs;
  padding: @space-xl @space-2xl;
  margin: 0;
  border: none;
  background: var(--card-color);
  text-align: left;
  color: inherit;
  font: inherit;

  &.clickable {
    cursor: pointer;

    &:hover {
      background: var(--shallow-hover-bg-color);
    }
  }
}

.admin-stat-strip__label {
  margin: 0;
  font-size: @font-size-xs;
  color: var(--mute-color);
}

.admin-stat-strip__value {
  margin: 0;
  font-size: @font-size-2xl;
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-color);
}

.admin-stat-strip__desc {
  margin: 0;
  font-size: @font-size-xs;
  color: var(--tertiary-color);
}
</style>
