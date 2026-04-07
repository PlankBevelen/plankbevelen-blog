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
/* Removed #main padding to avoid double padding with .container */
</style>
