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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isLoginPage = computed(() => route.path === '/admin/login')
const isCollapsed = ref(false)
const toggleCollapsed = () => { isCollapsed.value = !isCollapsed.value }

const navTitleMap: Record<string, string> = {
  '/admin': '控制台',
  '/admin/content/article': '文章管理',
  '/admin/content/article/edit': '编辑文章',
  '/admin/content/category': '分类管理',
  '/admin/setting': '网站设置',
  '/admin/system': '系统信息',
}

const navTitle = computed(() => navTitleMap[route.path] || '管理后台')
</script>

<style scoped lang="less">
@sidebar-width: 220px;
@sidebar-collapsed-width: 64px;

.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--admin-bg-color, #f5f7fa);
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
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}
</style>
