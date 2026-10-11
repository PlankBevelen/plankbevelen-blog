<template>
  <div class="admin-layout">
    <template v-if="!isLoginPage">
      <LayoutAdminSideBar :isCollapsed="isCollapsed" />
      <div class="admin-main">
        <LayoutAdminHeader
          :collapsed="isCollapsed"
          :navTitle="navTitle"
          @toggle="toggleCollapsed"
        />
        <div class="admin-content">
          <NuxtPage />
        </div>
      </div>
    </template>
    <template v-else>
      <NuxtPage />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/admin/login')
const isCollapsed = ref(false)

const navTitleMap: Record<string, string> = {
  '/admin': '概览',
  '/admin/content/article': '文章',
  '/admin/content/article/edit': '编辑文章',
  '/admin/content/category': '分类',
  '/admin/site/content': '站点内容',
  '/admin/site/logs': '访问',
  '/admin/site/friend-links': '友链',
  '/admin/site/settings': '设置'
}

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
}

const navTitle = computed(() => navTitleMap[route.path] || '管理后台')
</script>

<style scoped lang="less">
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-color);
}

.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: @space-3xl;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  background-color: var(--bg-color);
}
</style>
