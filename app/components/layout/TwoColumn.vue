<template>
  <div class="two-column-layout">
    <div class="content" :class="[type]">
      <!-- 左列 -->
      <div class="left">
        <div v-if="showSkeleton">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 140px"
              />
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 140px; margin-top: 20px"
              />
            </template>
          </el-skeleton>
        </div>
        <div v-show="!showSkeleton" class="slot-wrapper">
          <slot name="left"></slot>
        </div>
      </div>

      <!-- 右列（文章详情页的主内容区） -->
      <div class="right">
        <div v-if="showSkeleton">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item
                variant="h1"
                style="width: 60%; margin: 0 auto 10px"
              />
              <el-skeleton-item
                variant="text"
                style="width: 40%; margin: 0 auto 20px"
              />
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" style="width: 80%" />
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 400px; margin-top: 20px"
              />
            </template>
          </el-skeleton>
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
  grid-gap: 20px;
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
  gap: @base-gap;
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
  gap: @base-gap;
}

@media (max-width: 1024px) {
  .content {
    grid-template-columns: 1fr !important;
    .left,
    .right {
      position: static !important;
    }
  }
}
</style>
