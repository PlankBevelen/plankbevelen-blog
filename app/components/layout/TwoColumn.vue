<template>
  <div class="two-column-layout">
    <div class="content" :class="[type]">
      <!-- 左列 -->
      <div class="left">
        <div v-if="showSkeleton" class="col-skeleton" aria-hidden="true">
          <span style="height: 140px"></span>
          <span style="height: 140px"></span>
        </div>
        <div v-show="!showSkeleton" class="slot-wrapper">
          <slot name="left"></slot>
        </div>
      </div>

      <!-- 右列（文章详情页的主内容区） -->
      <div class="right">
        <div v-if="showSkeleton" class="col-skeleton" aria-hidden="true">
          <span style="width: 60%; height: 28px; margin-inline: auto"></span>
          <span style="width: 40%; height: 16px; margin-inline: auto"></span>
          <span style="height: 16px"></span>
          <span style="height: 16px"></span>
          <span style="width: 80%; height: 16px"></span>
          <span style="height: 400px"></span>
        </div>
        <div v-show="!showSkeleton" class="slot-wrapper">
          <slot name="right"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useMinSkeleton } from '@/composables/useMinSkeleton'

const props = defineProps({
  type: {
    type: String,
    default: 'rightbigger'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const { showSkeleton } = useMinSkeleton(toRef(props, 'loading'))
</script>

<style lang="less" scoped>
.two-column-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.content {
  display: grid;
  grid-gap: @space-3xl;
  width: 100%;
  align-items: start;
  &.leftbigger {
    grid-template-columns: 2fr 1fr;
  }
  &.rightbigger {
    grid-template-columns: 1fr 2.5fr;
  }
  &.equal {
    grid-template-columns: 1fr 1fr;
  }
}
.left,
.right {
  display: flex;
  flex-direction: column;
  gap: @space-base;
  min-width: 0;
}

.content.rightbigger {
  .left {
    position: sticky;
    top: var(--layout-sticky-top);
    align-self: start;
  }
}

.content.leftbigger {
  .right {
    position: sticky;
    top: var(--layout-sticky-top);
    align-self: start;
  }
}

.content.equal {
  .left,
  .right {
    position: static;
  }
}
.slot-wrapper {
  display: flex;
  flex-direction: column;
  gap: @space-base;
}
.col-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  span {
    display: block;
    width: 100%;
    border-radius: 6px;
    background: color-mix(in srgb, var(--text-color) 8%, var(--card-color));
    animation: skeleton-pulse 1.4s ease-in-out infinite;
  }
}
@keyframes skeleton-pulse {
  0%,
  100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@media (max-width: @screen-lg) {
  .content {
    grid-template-columns: 1fr !important;
    .left,
    .right {
      position: static !important;
    }
  }
}
</style>
