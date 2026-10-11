<template>
  <div class="base-query-bar">
    <div class="base-query-bar__filters">
      <slot />
    </div>
    <div v-if="$slots.actions" class="base-query-bar__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="less">
.base-query-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: @space-lg;
  width: 100%;
}

.base-query-bar__filters {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-base;
  min-width: 0;
}

.base-query-bar__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-base;
}
</style>
