<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  
</template>

<script setup lang="ts">
import { setRem } from '@/utils/rem'
import { onMounted} from 'vue'
import { debounce } from 'lodash-es'

onMounted(() => {
    setRem()
    window.addEventListener('resize', debounce(setRem, 100))
})

</script>
