<template>
  <header class="header">
    <div class="header-container">
      <!-- 产品名称 -->
      <div class="logo">
        <img src="/logo.png" alt="" target="_" />
        <h1>羽毛笔</h1>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav" :class="{ 'nav-hidden': isMobileMenuHidden }">
        <ul class="nav-list">
          <li class="nav-item" exact>
            <router-link to="/" class="nav-link">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/solve" class="nav-link">文档处理</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/history" class="nav-link">历史记录</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/toolbox" class="nav-link">工具箱</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/help" class="nav-link">帮助</router-link>
          </li>
        </ul>
      </nav>

      <!-- 用户信息 -->
      <div class="user-info" :class="{ 'user-info-hidden': isMobileMenuHidden }">
        <div class="avatar">
          <img src="/favicon.ico" alt="用户头像" />
        </div>
        <span class="username">用户昵称</span>
        <svg-icon name="home"></svg-icon>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isMobileMenuHidden = ref(true)
const isMobile = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    isMobileMenuHidden.value = true
  }
}

const toggleMobileMenu = () => {
  isMobileMenuHidden.value = !isMobileMenuHidden.value
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style lang="less" scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--white);
  border-bottom: 1px solid var(--border-color);
  height: 64px;

  .header-container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 20px 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    height: 100%;
    align-items: center;
    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: var(--primary-color);
    }

    img {
      height: 64px;
      width: auto;
      object-fit: cover;
    }
  }

  .nav {
    flex: 1;
    display: flex;
    justify-content: center;

    .nav-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 32px;

      .nav-item {
        .nav-link {
          text-decoration: none;
          color: var(--text-color);
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 4px;
          transition: all 0.3s ease;

          &:hover {
            color: var(--primary-color);
          }

          &.router-link-exact-active {
            color: var(--primary-color);
          }
        }
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .username {
      font-weight: 500;
      color: #333;
    }
  }

  .mobile-menu-btn {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    gap: 4px;

    span {
      width: 20px;
      height: 2px;
      background: #333;
      transition: all 0.3s ease;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .nav {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;

      &:not(.nav-hidden) {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .nav-list {
        flex-direction: column;
        padding: 16px;
        gap: 8px;

        .nav-item {
          .nav-link {
            display: block;
            padding: 12px 16px;
          }
        }
      }
    }

    .user-info {
      position: absolute;
      top: 100%;
      right: 20px;
      background: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;

      &:not(.user-info-hidden) {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
    }

    .mobile-menu-btn {
      display: flex;
    }
  }
}
</style>
