<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>登录</h2>
          <p>欢迎回来，请登录您的账户</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input 
              id="email"
              v-model="loginForm.email" 
              type="email" 
              placeholder="请输入邮箱"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <el-input 
              id="password"
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox"
                v-model="rememberMe"
                :disabled="isLoading"
              />
              30天内免登录
            </label>
          </div>
          
          <button type="submit" class="login-btn" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <div class="login-footer">
          <p>还没有账户？<NuxtLink to="/register">立即注册</NuxtLink></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user'
import http from '@/utils/http-common'
import CryptoJS from 'crypto-js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLoading = ref(false)
const rememberMe = ref(false)
const loginForm = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    alert('请填写完整信息')
    return
  }
  
  isLoading.value = true
  
  try {
    // 对密码进行SHA256加密
    const hashedPassword = CryptoJS.SHA256(loginForm.password).toString()
    
    // 使用userStore的login方法
    const result = await userStore.login({
      email: loginForm.email,
      password: hashedPassword
    }, rememberMe.value)
    
    console.log('登录页面 - userStore.login结果:', result)
    
    if (result.message === '登录成功') {
      ElMessage.success(result.message)
      
      // 获取重定向路径
      const redirect = route.query.redirect as string || '/'
      
      // 跳转到目标页面
      await router.push(redirect)
    } else {
      alert(result.message)
    }
  } catch (error: any) {
    console.error('登录错误:', error)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时初始化用户状态
onMounted(() => {
  userStore.initUserState()
})

// 设置页面标题
useHead({
  title: '登录 - Plankbevelen Blog'
})
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  h2 {
    color: #333;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    font-size: 14px;
  }
}

.login-form {
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      color: #333;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      font-weight: normal;
      cursor: pointer;
      
      input[type="checkbox"] {
        width: auto;
        margin-right: 8px;
        cursor: pointer;
      }
    }
    
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      box-sizing: border-box;
      
      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      
      &::placeholder {
        color: #999;
      }
    }
  }
  
  .login-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  
  p {
    color: #666;
    font-size: 14px;
    
    a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>