<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-logo">
      <img src="/img/logo.webp" alt="logo" class="logo-img" width="32" height="32" />
      <div v-show="!isCollapsed" class="logo-copy">
        <span class="logo-text">PlankBevelen</span>
        <span class="logo-subtitle">管理后台</span>
      </div>
    </div>

    <el-menu
      :collapse="isCollapsed"
      :default-active="activeIndex"
      class="sidebar-menu"
      :collapse-transition="false"
    >
      <el-menu-item index="1" @click="navigateTo('/admin')">
        <el-icon><Odometer /></el-icon>
        <template #title>控制台</template>
      </el-menu-item>

      <el-sub-menu index="2">
        <template #title>
          <el-icon><Files /></el-icon>
          <span>内容管理</span>
        </template>
        <el-menu-item index="2-1" @click="navigateTo('/admin/content/article')">
          文章管理
        </el-menu-item>
        <el-menu-item index="2-2" @click="navigateTo('/admin/content/category')">
          分类管理
        </el-menu-item>
        <el-menu-item index="2-3" @click="navigateTo('/admin/content/statistics')">
          数据统计
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>网站管理</span>
        </template>
        <el-menu-item index="3-0" @click="navigateTo('/admin/site/content')">
          站点内容
        </el-menu-item>
        <el-menu-item index="3-1" @click="navigateTo('/admin/site/info')">
          网站信息
        </el-menu-item>
        <el-menu-item index="3-2" @click="navigateTo('/admin/site/data')">
          网站数据
        </el-menu-item>
        <el-menu-item index="3-3" @click="navigateTo('/admin/site/logs')">
          访问日志
        </el-menu-item>
      </el-sub-menu>
    </el-menu>

    <div class="sidebar-footer">
      <el-tooltip v-if="isCollapsed" content="退出登录" placement="right">
        <el-button link class="logout-icon-btn" @click="onLogout">
          <el-icon><SwitchButton /></el-icon>
        </el-button>
      </el-tooltip>
      <el-button v-else link class="logout-btn" @click="onLogout">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Files, Monitor, Odometer, SwitchButton } from '@element-plus/icons-vue'
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
  if (path.startsWith('/admin/content/statistics')) return '2-3'
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

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  overflow: hidden;

  .logo-img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
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
  font-size: 12px;
  color: var(--tertiary-color);
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border: none !important;
  background-color: transparent !important;
  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;

  &.el-menu--collapse {
    padding: 12px 4px;
    width: @sidebar-collapsed-width !important;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 44px;
    line-height: 44px;
    border-radius: @base-border-radius;
    margin-bottom: 4px;
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
  padding: 12px 8px;
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
    gap: 8px;
    color: var(--tertiary-color);
    font-size: @font-size-sm;
    padding: 0 12px;
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
    padding: 12px 4px;
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
  padding: 8px;
  border-radius: @base-border-radius;
}

:deep(.el-menu--popup .el-menu-item) {
  height: 38px;
  line-height: 38px;
  border-radius: @base-border-radius;
  padding: 0 12px;
  margin-bottom: 4px;
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
