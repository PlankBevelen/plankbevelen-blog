<template>
  <LayoutDefaultHeader />
  <div class="container pt-header">
    <slot />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'note',
})
</script>

<style lang="less" scoped>

</style>
