<template>
  <ClientOnly>
    <BaseParticles v-if="admin.getTheme === 'dark'"/>
  </ClientOnly>
  <LayoutDefaultHeader />
  <main id="main">
    <NuxtPage />
  </main>
  <LayoutDefaultFooter />
  <ClientOnly>
    <el-backtop :right="24" :bottom="24" :visibility-height="480" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useAdminStore } from '~/stores/admin.store'
const admin = useAdminStore()
</script>

