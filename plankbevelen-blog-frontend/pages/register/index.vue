<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>创建您的账户</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称"
            size="large"
            prefix-icon="User"
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            size="large"
            prefix-icon="Message"
            type="email"
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            type="password"
            show-password
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            placeholder="请确认密码"
            size="large"
            prefix-icon="Lock"
            type="password"
            show-password
            :disabled="loading"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-footer">
        <p>
          已有账户？
          <NuxtLink to="/login" class="login-link">立即登录</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Message, Lock, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import http from '@/utils/http-common'
import CryptoJS from 'crypto-js'

// 页面元数据
useHead({
  title: '用户注册 - Plankbevelen Blog'
})

// 响应式数据
const loading = ref(false)
const registerFormRef = ref<FormInstance>()
const userStore = useUserStore()
const router = useRouter()

// 注册表单数据
const registerForm = reactive({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 自定义验证器：确认密码
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 处理注册
const handleRegister = async () => {
  console.log('注册页面 - handleRegister 函数被调用')
  
  if (!registerFormRef.value) {
    console.log('注册页面 - registerFormRef.value 为空，返回')
    return
  }
  
  try {
    // 表单验证
    await registerFormRef.value.validate()
    
    loading.value = true
    
    console.log('注册页面 - 开始注册流程')
    
    // 对密码进行SHA256加密
    const hashedPassword = CryptoJS.SHA256(registerForm.password).toString()
    console.log('注册页面 - 密码已SHA256加密')
    
    // 使用userStore的register方法
    const result = await userStore.register({
      nickname: registerForm.nickname,
      email: registerForm.email,
      password: hashedPassword
    })
    
    console.log('注册页面 - userStore.register结果:', result)
    
    if (result.message.includes('成功')) {
      console.log('注册页面 - 注册成功，准备跳转')
      ElMessage.success(result.message)
      
      // 跳转到登录页面
      await router.push('/login')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error: any) {
    console.error('注册页面 - 注册错误:', error)
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  
  .register-header {
    text-align: center;
    margin-bottom: 30px;
    
    h2 {
      color: #333;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
    }
    
    p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
  }
  
  .register-form {
    .el-form-item {
      margin-bottom: 20px;
    }
    
    .register-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      }
    }
  }
  
  .register-footer {
    text-align: center;
    margin-top: 20px;
    
    p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    
    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        color: #5a6fd8;
        text-decoration: underline;
      }
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .register-container {
    padding: 10px;
  }
  
  .register-box {
    padding: 30px 20px;
  }
}
</style>