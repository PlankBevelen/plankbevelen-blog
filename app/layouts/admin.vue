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
  '/admin': '控制台',
  '/admin/content/article': '文章管理',
  '/admin/content/article/edit': '编辑文章',
  '/admin/content/category': '分类管理',
  '/admin/content/notes': '笔记管理',
  '/admin/content/notes/edit': '编辑笔记',
  '/admin/content/note-category': '笔记分类',
  '/admin/content/statistics': '统计分析',
  '/admin/site/content': '站点内容',
  '/admin/site/info': '站点信息',
  '/admin/site/data': '站点数据',
  '/admin/site/logs': '访问日志',
  '/admin/site/friend-links': '友链管理'
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
  padding: @space-3xl;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  background-color: var(--bg-color);
}
</style>
