<template>
    <div class="manage">
        <div class="manage-header">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/manage' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="currentPageName">{{ currentPageName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-button type="primary" @click="goToSite">
              <svg-icon name="home" class="site-icon" color="#fff"/>
              返回网站
            </el-button>
        </div>

        <div class="manage-content">
            <div class="manage-overview" v-show="!isNavigating">
                <div class="welcome-section">
                    <h1>欢迎回来，{{ userStore.userName }}！</h1>
                    <p>这里是您的管理后台，您可以管理网站的各项内容。</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg-icon name="article" color="#666" />
                        </div>
                        <div class="stat-content">
                            <h3>文章总数</h3>
                            <p class="stat-number">{{ stats.articles }}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg-icon name="about" color="#666" />
                        </div>
                        <div class="stat-content">
                            <h3>说说总数</h3>
                            <p class="stat-number">{{ stats.talks }}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg-icon name="comment" />
                        </div>
                        <div class="stat-content">
                            <h3>评论总数</h3>
                            <p class="stat-number">{{ stats.comments }}</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg-icon name="friend" color="#666" />
                        </div>
                        <div class="stat-content">
                            <h3>友链总数</h3>
                            <p class="stat-number">{{ stats.friends }}</p>
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h2>快速操作</h2>
                    <div class="actions-grid">
                        <NuxtLink to="/manage/article" class="action-card">
                            <svg-icon name="article" class="action-icon" color="#666"/>
                            <h3>文章管理</h3>
                            <p>管理您的博客文章</p>
                        </NuxtLink>
                        
                        <NuxtLink to="/manage/about" class="action-card">
                            <svg-icon name="about" class="action-icon" color="#666"/>
                            <h3>说说管理</h3>
                            <p>管理您的动态说说</p>
                        </NuxtLink>
                        
                        <NuxtLink to="/manage/album" class="action-card">
                            <svg-icon name="album" class="action-icon" color="#666" />
                            <h3>相册管理</h3>
                            <p>管理您的图片相册</p>
                        </NuxtLink>
                        
                        <NuxtLink to="/manage/friend" class="action-card">
                            <svg-icon name="friend" class="action-icon" color="#666"/>
                            <h3>友链管理</h3>
                            <p>管理友情链接</p>
                        </NuxtLink>
                    </div>
                </div>
            </div>
            <NuxtPage />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from '~/stores/user'
import { useRoute } from 'vue-router'

// 使用admin布局
definePageMeta({
  layout: 'admin'
})

const userStore = useUserStore()
const route = useRoute()

// 导航状态
const isNavigating = ref(false)

// 当前页面名称
const currentPageName = computed(() => {
  const path = route.path
  const pageMap: Record<string, string> = {
    '/manage/article': '文章管理',
    '/manage/about': '说说管理',
    '/manage/album': '相册管理',
    '/manage/friend': '友链管理'
  }
  return pageMap[path] || ''
})

// 统计数据
const stats = ref({
  articles: 0,
  talks: 0,
  comments: 0,
  friends: 0
})

// 获取统计数据
const fetchStats = async () => {
  try {
    // 这里应该调用实际的API获取统计数据
    // 暂时使用模拟数据
    stats.value = {
      articles: 25,
      talks: 48,
      comments: 156,
      friends: 12
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 监听路由变化
watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== oldPath && newPath !== '/manage') {
    isNavigating.value = true
  } else if (newPath === '/manage') {
    isNavigating.value = false
  }
}, { immediate: true })

// 返回网站
const goToSite = () => {
  window.open('/', '_blank')
}

onMounted(() => {
  fetchStats()
  if (route.path === '/manage') {
    isNavigating.value = false
  }
})
</script>

<style lang="less" scoped>
.manage {
  min-height: 100vh;
  background: #f5f5f5;
  
  .manage-header {
    background: white;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .el-breadcrumb {
      font-size: 14px;
    }
    
    .el-button {      
      .site-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }
    }
  }
  
  .manage-content {
    padding: 24px;
  }
}

.manage-overview {
  .welcome-section {
    background: white;
    padding: 32px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      color: #262626;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      font-size: 16px;
      color: #8c8c8c;
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
    
    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        background: #f0f9ff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        :deep(svg) {
          width: 24px;
          height: 24px;
          color: #1890ff;
        }
      }
      
      .stat-content {
        flex: 1;
        
        h3 {
          margin: 0 0 4px;
          font-size: 14px;
          color: #8c8c8c;
          font-weight: 500;
        }
        
        .stat-number {
          margin: 0;
          font-size: 24px;
          color: #262626;
          font-weight: 600;
        }
      }
    }
  }
  
  .quick-actions {
    background: white;
    padding: 32px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    h2 {
      margin: 0 0 24px;
      font-size: 20px;
      color: #262626;
      font-weight: 600;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      
      .action-card {
        padding: 20px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;
        display: block;
        
        &:hover {
          border-color: #1890ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(24, 144, 255, 0.1);
        }
        
        .action-icon {
          width: 32px;
          height: 32px;
          color: #1890ff;
          margin-bottom: 12px;
        }
        
        h3 {
          margin: 0 0 8px;
          font-size: 16px;
          color: #262626;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #8c8c8c;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .manage-overview {
    .welcome-section {
      padding: 20px;
      
      h1 {
        font-size: 24px;
      }
    }
    
    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      
      .stat-card {
        padding: 16px;
      }
    }
    
    .quick-actions {
      padding: 20px;
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>