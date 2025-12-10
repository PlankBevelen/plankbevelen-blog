<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  
</template>

<script setup lang="ts">
import { setRem } from '@/utils/rem'
import { onMounted } from 'vue'


/* onMounted(() => {
  setRem()
  window.addEventListener('resize', setRem)
}) */
</script>
