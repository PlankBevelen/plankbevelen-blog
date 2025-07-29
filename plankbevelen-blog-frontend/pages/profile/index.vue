<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <img :src="userStore.userAvatar" :alt="userStore.userName" class="profile-avatar" />
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :on-change="handleAvatarChange"
              :auto-upload="false"
              accept=".jpg,.jpeg,.png,.svg,.ico"
            >
              <button class="change-avatar-btn">
                <el-icon><Upload /></el-icon>
                更换头像
              </button>
            </el-upload>
          </div>
          <div class="user-info">
            <h2>{{ userStore.userName }}</h2>
            <p>{{ userStore.userInfo?.email || '未设置邮箱' }}</p>
          </div>
        </div>
        
        <div class="profile-content">
          <div class="section">
            <h3>个人信息</h3>
            <form @submit.prevent="handleUpdateProfile" class="profile-form">
              <div class="form-group">
                <label for="nickname">昵称</label>
                <input 
                  id="nickname"
                  v-model="profileForm.nickname" 
                  type="text" 
                  placeholder="请输入昵称"
                />
              </div>
              
              <div class="form-group">
                <label for="email">邮箱</label>
                <input 
                  id="email"
                  v-model="profileForm.email" 
                  type="email" 
                  placeholder="请输入邮箱"
                />
              </div>
              
              <div class="form-actions">
                <button type="submit" class="save-btn" :disabled="isLoading">
                  {{ isLoading ? '保存中...' : '保存更改' }}
                </button>
                <button type="button" class="logout-btn" @click="handleLogout">
                  退出登录
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { ElMessage } from 'element-plus'
import { Picture, Upload } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(false)
const profileForm = reactive({
  nickname: '',
  email: ''
})
const avatarForm = reactive({
  url: ''
})

// 检查登录状态
const checkAuth = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return false
  }
  return true
}

// 初始化表单数据
const initForm = () => {
  if (userStore.userInfo) {
    profileForm.nickname = userStore.userInfo.nickname || ''
    profileForm.email = userStore.userInfo.email || ''
  }
}

// 头像文件选择处理
const handleAvatarChange = (file: any) => { 
  console.log("文件选择事件触发", file)
  const rawFile = file.raw
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon', 'image/png']
  
  if (!rawFile || !rawFile.type || !allowedTypes.includes(rawFile.type)) {
    ElMessage.error('只允许上传 JPG、PNG、SVG、ICO 格式的图片')
    return
  }
  
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }
  
  // 验证通过，处理文件上传
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const base64 = e.target?.result as string
      await userStore.updateUserInfo({ avatar: JSON.stringify(base64) })
      ElMessage.success('头像更新成功！')
    } catch (error) {
      ElMessage.error('头像更新失败')
    }
  }
  reader.readAsDataURL(rawFile)
}

// 更新个人资料
const handleUpdateProfile = async () => {
  if (!profileForm.nickname || !profileForm.email) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  isLoading.value = true
  
  try {
    userStore.updateUserInfo({
      nickname: profileForm.nickname,
      email: profileForm.email
    })
    
    ElMessage.success('个人信息更新成功！')
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/')
  }
}

onMounted(() => {
  if (checkAuth()) {
    initForm()
  }
})

// 设置页面标题
useHead({
  title: '个人资料 - Plankbevelen Blog'
})
</script>

<style lang="less" scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px 20px;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  color: white;
  
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    
    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
    
    .change-avatar-btn {
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
  
  .user-info {
    h2 {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 16px;
      opacity: 0.9;
    }
  }
}

.profile-content {
  padding: 40px;
  
  .section {
    h3 {
      color: #333;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0f0f0;
    }
  }
}

.profile-form {
  .form-group {
    margin-bottom: 24px;
    
    label {
      display: block;
      color: #333;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
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
    }
  }
  
  .form-actions {
    display: flex;
    gap: 16px;
    margin-top: 32px;
    
    .save-btn {
      flex: 1;
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
    
    .logout-btn {
      padding: 14px 24px;
      background: transparent;
      color: #dc3545;
      border: 2px solid #dc3545;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: #dc3545;
        color: white;
        transform: translateY(-2px);
      }
    }
  }
}

.avatar-preview {
  .preview-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e1e5e9;
  }
  
  .image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #f5f5f5;
    color: #999;
    font-size: 12px;
    
    .el-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>