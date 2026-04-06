<template>
  <ClientOnly>
    <BaseParticles v-if="admin.getTheme === 'dark'"/>
  </ClientOnly>
  <LayoutDefaultHeader />
  <main id="main">
    <NuxtPage />
  </main>
  <LayoutDefaultFooter />
</template>

<script setup lang="ts">
import { useAdminStore } from '~/stores/admin.store'
const admin = useAdminStore()
</script>

<style lang="less">
@media (max-width: @max-content-width) {
  #main {
    padding: 0 20px;
  }
}
</style>
