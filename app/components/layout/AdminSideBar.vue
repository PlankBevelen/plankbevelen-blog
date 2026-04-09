<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <img src="/img/logo.webp" alt="logo" class="logo-img" width="32" height="32" />
      <span class="logo-text" v-show="!isCollapsed">PlankBevelen</span>
    </div>

    <!-- 菜单 -->
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
      </el-sub-menu>

      <el-menu-item index="3" @click="navigateTo('/admin/setting')">
        <el-icon><Setting /></el-icon>
        <template #title>网站设置</template>
      </el-menu-item>

      <el-menu-item index="4" @click="navigateTo('/admin/system')">
        <el-icon><Monitor /></el-icon>
        <template #title>系统信息</template>
      </el-menu-item>
    </el-menu>

    <!-- 底部退出 -->
    <div class="sidebar-footer" v-show="!isCollapsed">
      <el-button link class="logout-btn" @click="onLogout">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Odometer, Files, Setting, Monitor, SwitchButton } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/admin.store'
import { ElMessageBox } from 'element-plus'

defineProps<{ isCollapsed: boolean }>()

const route = useRoute()
const adminStore = useAdminStore()

const activeIndex = computed(() => {
  const path = route.path
  if (path === '/admin' || path === '/admin/') return '1'
  if (path.startsWith('/admin/content/article')) return '2-1'
  if (path.startsWith('/admin/content/category')) return '2-2'
  if (path.startsWith('/admin/setting')) return '3'
  if (path.startsWith('/admin/system')) return '4'
  return '1'
})

const onLogout = async () => {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning',
  }).catch(() => {})
  await adminStore.logout?.()
  navigateTo('/admin/login', { replace: true })
}
</script>

<style scoped lang="less">
// 侧边栏宽度常量，和 admin.vue 保持一致
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

// Logo
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

  .logo-text {
    font-size: @font-size-md;
    font-weight: 700;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
  }
}

// 菜单
.sidebar-menu {
  flex: 1;
  border: none !important;
  background-color: transparent !important;
  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;

  // 折叠时居中图标
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

// 底部退出
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;

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
</style>