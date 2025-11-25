<template>
  <Header />
  <main id="main">
    <NuxtPage />
  </main>
</template>

<script setup lang="ts">
import Header from './adminLayout/Header.vue'
</script>

<style scoped lang="less">
main {
  padding-top: @header-height;
  min-height: calc(100vh - @header-height);
}
</style>

