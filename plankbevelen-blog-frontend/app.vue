<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useUserStore } from '~/stores/user';
const userStore = useUserStore()

onMounted(()=>{
  userStore.initUserState()
})
</script>

<style lang="less">
body {
  margin: 0;
}
</style>
