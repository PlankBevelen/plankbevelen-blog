<template>
  <header class="admin-header">
    <div class="header-left">
      <el-button class="toggle-btn" text :aria-expanded="!collapsed" aria-label="切换侧栏" @click="$emit('toggle')">
        <nuxt-icon name="admin/header/expand" class="header-icon" v-if="collapsed" />
        <nuxt-icon name="admin/header/fold" class="header-icon" v-else />
      </el-button>

      <div class="title-group">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">控制台</el-breadcrumb-item>
          <el-breadcrumb-item v-if="navTitle !== '控制台'">
            {{ navTitle }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <p class="header-date">{{ currentDateText }}</p>
      </div>
    </div>

    <div class="header-right">
      <el-tooltip content="访问前台" placement="bottom">
        <el-button text @click="openFrontend">
          <nuxt-icon name="admin/header/link" class="header-icon" />
        </el-button>
      </el-tooltip>

      <el-tooltip :content="isDark ? '切换浅色主题' : '切换深色主题'" placement="bottom">
        <el-button text :aria-label="isDark ? '切换浅色主题' : '切换深色主题'" @click="toggleTheme">
          <el-icon :size="18">
            <nuxt-icon name="header/sun" class="header-icon" v-if="isDark" />
            <nuxt-icon name="header/moon" class="header-icon" v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <el-dropdown trigger="click" @command="onCommand">
        <div class="avatar">
          <NuxtImg provider="ipx" src="/img/avatar.webp" alt="avatar" quality="60" loading="eager" width="32" height="32" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              <span class="dropdown-name">plankbevelen</span>
            </el-dropdown-item>
            <el-dropdown-item command="frontend">访问前台</el-dropdown-item>
            <el-dropdown-item command="logout" divided class="danger-item">
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
import { ElMessageBox } from 'element-plus'
import { useAdminStore } from '@/stores/admin.store'

defineProps<{ collapsed: boolean; navTitle: string }>()
defineEmits<{ (e: 'toggle'): void }>()

const adminStore = useAdminStore()

const isDark = computed(() => adminStore.getTheme === 'dark')
const currentDateText = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(new Date())
)

const toggleTheme = () => {
  adminStore.setTheme(isDark.value ? 'light' : 'dark')
}

const openFrontend = () => {
  window.open('/', '_blank')
}

const onCommand = async (cmd: string) => {
  if (cmd === 'frontend') {
    openFrontend()
    return
  }

  if (cmd === 'logout') {
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
  min-width: 0;
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

.title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.header-date {
  margin: 0;
  font-size: 12px;
  color: var(--tertiary-color);
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

  &:hover {
    border-color: var(--primary-color);
  }

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

.header-icon {
  font-size: @base-font-size;
}

:deep(.danger-item) {
  color: var(--danger-color, #f56c6c);
}
</style>
