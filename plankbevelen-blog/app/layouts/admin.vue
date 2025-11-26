<template>
  <Header v-if="!hidden" :collapsed="isCollapsed" :navTitle="navTitle" @toggle="toggleCollapsed" />
  <main id="main">
    <SideBar :isCollapsed="isCollapsed" v-if="!hidden" />
    <template v-if="!hidden">
      <div class="content">
        <NuxtPage />
      </div>
    </template>
    <template v-else>
      <NuxtPage />
    </template>
  </main>
</template>

<script setup lang="ts">
import Header from './adminLayout/Header.vue'
import SideBar from './adminLayout/SideBar.vue'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
const router = useRouter()

const hidden = computed(() => {
  return router.currentRoute.value.path === '/admin/login'
})

const isCollapsed = ref(false)
const toggleCollapsed = () => { isCollapsed.value = !isCollapsed.value }

const navTitle = computed(() => {
  const path = router.currentRoute.value.path
  if (path === '/admin' || path === '/admin/') return '控制台'
  if (path === '/admin/login') return '登录'
  return '管理'
})
</script>

<style scoped lang="less">
#main {
  display: flex;
  height: calc(100vh - @header-height);
  min-height: calc(100vh - @header-height);
  .content {
    flex: 1;
    height: 100%;
    padding: 20px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--tertiary-color) transparent;
    background-color: #fff;
  }
}
</style>
