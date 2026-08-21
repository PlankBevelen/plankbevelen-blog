<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-logo">
      <NuxtImg provider="ipx" src="/img/logo.webp" alt="logo" quality="70" loading="eager" class="logo-img" width="32" height="32" />
      <div v-show="!isCollapsed" class="logo-copy">
        <span class="logo-text">plankbevelen</span>
        <span class="logo-subtitle">Admin Console</span>
      </div>
    </div>

    <el-menu
      :collapse="isCollapsed"
      :default-active="activeIndex"
      class="sidebar-menu"
      :collapse-transition="false"
      :default-openeds="['2', '3']"
    >
      <el-menu-item index="1" @click="navigateTo('/admin')">
        <nuxt-icon name="admin/sidebar/odometer" class="sidebar-icon" />
        <template #title>控制台</template>
      </el-menu-item>

      <el-sub-menu index="2">
        <template #title>
          <nuxt-icon name="admin/sidebar/files" class="sidebar-icon" />
          <span>内容管理</span>
        </template>
        <el-menu-item index="2-1" @click="navigateTo('/admin/content/article')">
          文章管理
        </el-menu-item>
        <el-menu-item index="2-2" @click="navigateTo('/admin/content/category')">
          文章分类
        </el-menu-item>
        <el-menu-item index="2-3" @click="navigateTo('/admin/content/notes')">
          笔记管理
        </el-menu-item>
        <el-menu-item index="2-4" @click="navigateTo('/admin/content/note-category')">
          笔记分类
        </el-menu-item>
        <el-menu-item index="2-5" @click="navigateTo('/admin/content/statistics')">
          统计分析
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <nuxt-icon name="admin/sidebar/monitor" class="sidebar-icon" />
          <span>站点管理</span>
        </template>
        <el-menu-item index="3-0" @click="navigateTo('/admin/site/content')">
          站点内容
        </el-menu-item>
        <el-menu-item index="3-1" @click="navigateTo('/admin/site/info')">
          站点信息
        </el-menu-item>
        <el-menu-item index="3-2" @click="navigateTo('/admin/site/data')">
          站点数据
        </el-menu-item>
        <el-menu-item index="3-3" @click="navigateTo('/admin/site/logs')">
          访问日志
        </el-menu-item>
      </el-sub-menu>
    </el-menu>

    <div class="sidebar-footer">
      <el-tooltip v-if="isCollapsed" content="退出登录" placement="right">
        <el-button link class="logout-icon-btn" @click="onLogout">
          <nuxt-icon name="admin/switch" class="sidebar-icon" />
        </el-button>
      </el-tooltip>
      <el-button v-else link class="logout-btn" @click="onLogout">
        <nuxt-icon name="admin/switch" class="sidebar-icon" />
        退出登录
      </el-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/admin.store'

defineProps<{ isCollapsed: boolean }>()

const route = useRoute()
const adminStore = useAdminStore()

const activeIndex = computed(() => {
  const path = route.path
  if (path === '/admin' || path === '/admin/') return '1'
  if (path.startsWith('/admin/content/article')) return '2-1'
  if (path.startsWith('/admin/content/category')) return '2-2'
  if (path.startsWith('/admin/content/notes')) return '2-3'
  if (path.startsWith('/admin/content/note-category')) return '2-4'
  if (path.startsWith('/admin/content/statistics')) return '2-5'
  if (path.startsWith('/admin/site/content')) return '3-0'
  if (path.startsWith('/admin/site/info')) return '3-1'
  if (path.startsWith('/admin/site/data')) return '3-2'
  if (path.startsWith('/admin/site/logs')) return '3-3'
  return '1'
})

const onLogout = async () => {
  const confirmed = await ElMessageBox.confirm('确定要退出当前后台账号吗？', '退出登录', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => true)
    .catch(() => false)

  if (!confirmed) return
  await adminStore.logout?.()
  navigateTo('/admin/login', { replace: true })
}
</script>

<style scoped lang="less">
@sidebar-width: 220px;
@sidebar-collapsed-width: 64px;

.sidebar {
  width: @sidebar-width;
  min-width: @sidebar-width;
  height: 100vh;
  background-color: var(--card-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
  position: sticky;
  top: 0;

  &.collapsed {
    width: @sidebar-collapsed-width;
    min-width: @sidebar-collapsed-width;
  }
}

.sidebar-icon {
  margin: 0 @space-base 0 0;
  font-size: @base-font-size;
}

.sidebar-logo {
  height: @admin-header-height;
  display: flex;
  align-items: center;
  gap: @space-md;
  padding: 0 @space-2xl;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  overflow: hidden;

  .logo-img {
    width: 32px;
    height: 32px;
    border-radius: @base-border-radius;
    object-fit: cover;
    flex-shrink: 0;
  }
}

.logo-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.logo-text {
  font-size: @font-size-md;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;
}

.logo-subtitle {
  font-size: @font-size-xs;
  color: var(--tertiary-color);
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border: none !important;
  background-color: transparent !important;
  padding: @space-lg @space-base;
  overflow-y: auto;
  overflow-x: hidden;

  &.el-menu--collapse {
    padding: @space-lg @space-2xs;
    width: @sidebar-collapsed-width !important;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 44px;
    line-height: 44px;
    border-radius: @base-border-radius;
    margin-bottom: @space-2xs;
    font-size: @font-size-sm;
    color: var(--secondary-color);
    transition: background-color 0.15s, color 0.15s;

    &:hover {
      background-color: var(--shallow-hover-bg-color);
      color: var(--primary-color);
    }

    &.is-active {
      background-color: var(--shallow-active-bg-color);
      color: var(--primary-color);
      font-weight: 500;
    }
  }

  :deep(.el-sub-menu .el-menu-item) {
    height: 38px;
    line-height: 38px;
    font-size: @font-size-sm;
    padding-left: 48px !important;
    border-radius: @base-border-radius;
    margin-bottom: 2px;
  }

  :deep(.el-menu--inline) {
    background-color: transparent !important;
  }
}

.sidebar-footer {
  padding: @space-lg @space-base;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;

  .logout-icon-btn {
    width: 100%;
    height: 36px;
    padding: 0;
    border-radius: @base-border-radius;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tertiary-color);

    &:hover {
      color: var(--danger-color, #f56c6c);
      background-color: var(--shallow-hover-bg-color);
    }
  }

  .logout-btn {
    width: 100%;
    justify-content: flex-start;
    gap: @space-base;
    color: var(--tertiary-color);
    font-size: @font-size-sm;
    padding: 0 @space-lg;
    height: 36px;

    &:hover {
      color: var(--danger-color, #f56c6c);
      background-color: var(--shallow-hover-bg-color);
    }
  }
}

.sidebar.collapsed {
  .sidebar-logo {
    justify-content: center;
    padding: 0;
    gap: 0;
  }

  .sidebar-footer {
    padding: @space-lg @space-2xs;
  }
}

.sidebar-menu.el-menu--collapse {
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    padding: 0 !important;
    justify-content: center;
  }

  :deep(.el-menu-item .el-icon),
  :deep(.el-sub-menu__title .el-icon) {
    margin-right: 0 !important;
  }

  :deep(.el-sub-menu__icon-arrow) {
    display: none;
  }
}

:deep(.el-menu--popup) {
  background-color: var(--card-color) !important;
  border: 1px solid var(--border-color);
  padding: @space-base;
  border-radius: @base-border-radius;
}

:deep(.el-menu--popup .el-menu-item) {
  height: 38px;
  line-height: 38px;
  border-radius: @base-border-radius;
  padding: 0 @space-lg;
  margin-bottom: @space-2xs;
  color: var(--secondary-color);

  &:hover {
    background-color: var(--shallow-hover-bg-color);
    color: var(--primary-color);
  }

  &.is-active {
    background-color: var(--shallow-active-bg-color);
    color: var(--primary-color);
    font-weight: 500;
  }
}
</style>
