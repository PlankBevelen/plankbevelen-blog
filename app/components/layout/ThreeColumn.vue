<template>
  <div class="three-column-layout">
    <div class="content">
      <!-- 左列 -->
      <div class="left">
        <div v-if="loading">
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
        <div v-show="!loading" class="slot-wrapper">
          <slot name="left"></slot>
        </div>
      </div>

      <!-- 中间列 -->
      <div class="middle">
        <div v-if="loading">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 220px"
              />
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 140px; margin-top: 20px"
              />
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 140px; margin-top: 20px"
              />
            </template>
          </el-skeleton>
        </div>
        <!-- v-show 保证组件始终挂载，onMounted 正常触发，数据请求和骨架屏并行 -->
        <div v-show="!loading" class="slot-wrapper">
          <slot name="middle"></slot>
        </div>
      </div>

      <!-- 右列 -->
      <div class="right">
        <div v-if="loading">
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
        <div v-show="!loading" class="slot-wrapper">
          <slot name="right"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
.three-column-layout {
  height: auto;
}

.content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-gap: 20px;
  height: auto;
  position: relative;
  align-items: start;
}

.left,
.middle,
.right {
  display: flex;
  flex-direction: column;
  gap: @base-gap;
  min-width: 0;
}

.left, .right {
  position: sticky;
  top: var(--layout-sticky-top);
  align-self: start;
}

.slot-wrapper {
  display: flex;
  flex-direction: column;
  gap: @base-gap;
}

.left .slot-wrapper > * {
  animation: fly-in-from-top-left 0.3s ease-in-out;
}

.middle .slot-wrapper > * {
  animation: fly-in-from-center 0.3s ease-in-out;
}

.right .slot-wrapper > * {
  animation: fly-in-from-top-right 0.3s ease-in-out;
}

@media (max-width: 1024px) {
  .content {
    grid-template-columns: 1fr;
    .left {
      order: 1;
      position: static;
    }
    .middle {
      order: 2;
    }
    .right {
      order: 3;
      position: static;
    }
  }
}
</style>
