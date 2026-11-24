<template>
  <BaseCard class="about-content">
    <h1 class="title">{{ $t('pages.about.title') }}</h1>
    <div v-if="aboutMd" class="markdown-body" v-html="aboutMd"></div>
    <el-empty v-else description="暂无关于内容" />
  </BaseCard>
</template>

<script setup lang="ts">
defineProps<{
  aboutMd: string
}>()
</script>

<style scoped lang="less">
.about-content {
  overflow: hidden;
}

.title {
  margin: 0;
  font-size: @font-size-xxl;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}
</style>
