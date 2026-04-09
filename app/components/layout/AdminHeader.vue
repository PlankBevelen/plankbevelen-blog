<template>
  <header class="admin-header">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="header-left">
      <el-button
        class="toggle-btn"
        text
        @click="$emit('toggle')"
      >
        <el-icon :size="18">
          <Expand v-if="collapsed" />
          <Fold v-else />
        </el-icon>
      </el-button>

      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">控制台</el-breadcrumb-item>
        <el-breadcrumb-item v-if="navTitle !== '控制台'">
          {{ navTitle }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：主题切换 + 前台入口 + 头像 -->
    <div class="header-right">
      <!-- 前台入口 -->
      <el-tooltip content="访问前台" placement="bottom">
        <el-button text @click="openFrontend">
          <el-icon :size="18"><Link /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- 主题切换 -->
      <el-tooltip :content="isDark ? '切换浅色' : '切换深色'" placement="bottom">
        <el-button text @click="toggleTheme">
          <el-icon :size="18">
            <Sunny v-if="isDark" />
            <Moon v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 头像下拉 -->
      <el-dropdown trigger="click" @command="onCommand">
        <div class="avatar">
          <img src="/img/avatar.webp" alt="avatar" width="32" height="32" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              <span class="dropdown-name">PlankBevelen</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="frontend">访问前台</el-dropdown-item>
            <el-dropdown-item command="logout" style="color: var(--danger-color, #f56c6c)">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Expand, Fold, Link, Sunny, Moon } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/admin.store'

defineProps<{ collapsed: boolean; navTitle: string }>()
defineEmits<{ (e: 'toggle'): void }>()

const adminStore = useAdminStore()
const isDark = computed(() => adminStore.getTheme === 'dark')

const toggleTheme = () => {
  adminStore.setTheme(isDark.value ? 'light' : 'dark')
}

const openFrontend = () => {
  window.open('/', '_blank')
}

const onCommand = async (cmd: string) => {
  if (cmd === 'frontend') {
    openFrontend()
  } else if (cmd === 'logout') {
    const confirmed = await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => true).catch(() => false)
    if (!confirmed) return
    await adminStore.logout?.()
    navigateTo('/admin/login', { replace: true })
  }
}
</script>

<style scoped lang="less">
.admin-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: var(--card-color);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: @base-border-radius;
  color: var(--secondary-color);

  &:hover {
    background-color: var(--shallow-hover-bg-color);
    color: var(--text-color);
  }
}

:deep(.el-breadcrumb__inner) {
  font-size: @font-size-sm;
  color: var(--secondary-color);
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--text-color);
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;

  .el-button {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: @base-border-radius;
    color: var(--secondary-color);

    &:hover {
      background-color: var(--shallow-hover-bg-color);
      color: var(--text-color);
    }
  }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  margin-left: 4px;
  border: 2px solid var(--border-color);
  transition: border-color 0.2s;

  &:hover { border-color: var(--primary-color); }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.dropdown-name {
  font-size: @font-size-sm;
  color: var(--text-color);
  font-weight: 500;
}
</style>
