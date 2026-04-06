<template>
  <ClientOnly>
    <BaseParticles />
  </ClientOnly>
  <LayoutDefaultHeader />
  <main id="main">
    <NuxtPage />
  </main>
  <LayoutDefaultFooter />
</template>

<script setup lang="ts">



</script>

<style lang="less">
@media (max-width: @max-content-width) {
  #main {
    padding: 0 20px;
  }
}
</style>
