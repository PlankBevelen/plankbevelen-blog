<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="/logo.svg" alt="Logo" class="logo" />
        <h2>管理后台</h2>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h3>内容管理</h3>
          <ul>
            <li>
              <NuxtLink to="/manage/about" class="nav-link" active-class="active">
                <svg-icon name="about" class="nav-icon" />
                <span>说说管理</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/manage/article" class="nav-link" active-class="active">
                <svg-icon name="article" class="nav-icon" />
                <span>文章管理</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/manage/album" class="nav-link" active-class="active">
                <svg-icon name="album" class="nav-icon" />
                <span>相册管理</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/manage/friend" class="nav-link" active-class="active">
                <svg-icon name="friend" class="nav-icon" />
                <span>友链管理</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <div class="nav-section">
          <h3>系统管理</h3>
          <ul>
            <li>
              <NuxtLink to="/manage/users" class="nav-link" active-class="active">
                <svg-icon name="group" class="nav-icon" color="#fff"/>
                <span>用户管理</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/manage/comments" class="nav-link" active-class="active">
                <svg-icon name="comment" class="nav-icon" />
                <span>评论管理</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <img :src="userStore.userAvatar" :alt="userStore.userName" class="user-avatar" />
          <div class="user-details">
            <span class="username">{{ userStore.userName }}</span>
            <span class="role">管理员</span>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <svg-icon name="options" class="logout-icon" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <slot/>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 检查管理员权限
const checkAdminAccess = () => {
  if (!userStore.isLoggedIn || userStore?.userInfo?.email !== 'PlankBevelen@163.com') {
    router.push('/login')
    return false
  }
  return true
}

// 当前页面标题
const currentPageTitle = computed(() => {
  const routeName = route.name as string
  const titleMap: Record<string, string> = {
    'manage-about': '说说管理',
    'manage-article': '文章管理',
    'manage-album': '相册管理',
    'manage-friend': '友链管理',
    'manage-users': '用户管理',
    'manage-comments': '评论管理',
    'manage': '概览'
  }
  return titleMap[routeName] || '管理后台'
})

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}

// 页面加载时检查权限
onMounted(() => {
  checkAdminAccess()
})

// 监听路由变化，持续检查权限
watch(() => route.path, () => {
  if (route.path.startsWith('/manage')) {
    checkAdminAccess()
  }
})

// 设置页面标题
useHead({
  title: computed(() => `${currentPageTitle.value} - 管理后台`),
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<style lang="less" scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 260px;
  background: #001529;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
  
  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #002140;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .logo {
      width: 32px;
      height: 32px;
    }
    
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }
  }
  
  .sidebar-nav {
    flex: 1;
    padding: 20px 0;
    overflow-y: auto;
    
    .nav-section {
      margin-bottom: 30px;
      
      h3 {
        padding: 0 20px 10px;
        margin: 0 0 15px;
        font-size: 12px;
        color: #8c8c8c;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 1px solid #002140;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          .nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            color: #bfbfbf;
            text-decoration: none;
            transition: all 0.3s ease;
            
            .nav-icon {
              width: 16px;
              height: 16px;
              color: #bfbfbf;
            }
            
            span {
              font-size: 14px;
            }
            
            &:hover {
              background: #002140;
              color: #1890ff;
              
              .nav-icon {
                color: #1890ff;
              }
            }
            
            &.active {
              background: #1890ff;
              color: white;
              
              .nav-icon {
                color: white;
              }
            }
          }
        }
      }
    }
  }
  
  .sidebar-footer {
    padding: 20px;
    border-top: 1px solid #002140;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
      
      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .user-details {
        flex: 1;
        
        .username {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: white;
        }
        
        .role {
          display: block;
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
    
    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid #002140;
      color: #bfbfbf;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      .logout-icon {
        width: 14px;
        height: 14px;
      }
      
      span {
        font-size: 12px;
      }
      
      &:hover {
        background: #ff4d4f;
        border-color: #ff4d4f;
        color: white;
      }
    }
  }
}

.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  
  .content-header {
    background: white;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    
    .site-icon {
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }
  }
  
  .content-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .main-content {
    margin-left: 200px;
  }
}

@media (max-width: 576px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.open {
      transform: translateX(0);
    }
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style>