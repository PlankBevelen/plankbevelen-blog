<template>
  <div class="manage-friend">
    <div class="page-header">
      <h1>友链管理</h1>
      <button @click="showAddModal = true" class="add-btn">
        <svg-icon name="add" class="add-icon" />
        <span>添加友链</span>
      </button>
    </div>
    
    <div class="content-section">
      <div class="filter-bar">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索友链名称或描述..."
            class="search-input"
          />
          <svg-icon name="search" class="search-icon" />
        </div>
        
        <div class="filter-options">
          <select v-model="statusFilter" class="status-filter">
            <option value="">全部状态</option>
            <option value="active">正常</option>
            <option value="pending">待审核</option>
            <option value="inactive">已下线</option>
          </select>
        </div>
      </div>
      
      <div class="friends-list">
        <div v-for="friend in filteredFriends" :key="friend.id" class="friend-card">
          <div class="friend-avatar">
            <img 
              :src="friend.avatar || '/img/default-avatar.png'" 
              :alt="friend.name"
              class="avatar-image"
            />
          </div>
          
          <div class="friend-info">
            <div class="friend-header">
              <h3 class="friend-name">{{ friend.name }}</h3>
              <span class="status" :class="friend.status">{{ getStatusText(friend.status) }}</span>
            </div>
            
            <p class="friend-description">{{ friend.description || '暂无描述' }}</p>
            
            <div class="friend-details">
              <div class="detail-item">
                <span class="label">网站：</span>
                <a :href="friend.url" target="_blank" class="link">{{ friend.url }}</a>
              </div>
              <div class="detail-item" v-if="friend.email">
                <span class="label">邮箱：</span>
                <span class="value">{{ friend.email }}</span>
              </div>
              <div class="detail-item">
                <span class="label">添加时间：</span>
                <span class="value">{{ formatTime(friend.createTime) }}</span>
              </div>
            </div>
          </div>
          
          <div class="friend-actions">
            <button @click="visitSite(friend.url)" class="action-btn visit">
              <svg-icon name="link" />
              <span>访问</span>
            </button>
            <button @click="editFriend(friend)" class="action-btn edit">
              <svg-icon name="edit" />
              <span>编辑</span>
            </button>
            <button @click="deleteFriend(friend.id)" class="action-btn delete">
              <svg-icon name="delete" />
              <span>删除</span>
            </button>
          </div>
        </div>
        
        <div v-if="!filteredFriends.length" class="empty-state">
          <svg-icon name="empty" class="empty-icon" />
          <p>暂无友链数据</p>
        </div>
      </div>
      
      <div class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage <= 1"
          class="page-btn"
        >
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage >= totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>
    
    <!-- 添加/编辑友链弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingFriend ? '编辑友链' : '添加友链' }}</h2>
          <button @click="closeModal" class="close-btn">
            <svg-icon name="close" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>友链名称 *</label>
            <input 
              v-model="friendForm.name"
              type="text"
              placeholder="请输入友链名称"
              class="name-input"
            />
          </div>
          
          <div class="form-group">
            <label>网站地址 *</label>
            <input 
              v-model="friendForm.url"
              type="url"
              placeholder="请输入网站地址（如：https://example.com）"
              class="url-input"
            />
          </div>
          
          <div class="form-group">
            <label>头像地址</label>
            <div class="avatar-upload">
              <div v-if="friendForm.avatar" class="avatar-preview">
                <img :src="friendForm.avatar" alt="头像预览" class="preview-image" />
                <button @click="friendForm.avatar = ''" class="remove-avatar">
                  <svg-icon name="close" />
                </button>
              </div>
              <div v-else class="avatar-input-group">
                <input 
                  v-model="friendForm.avatar"
                  type="url"
                  placeholder="请输入头像地址"
                  class="avatar-input"
                />
                <button @click="addAvatar" class="add-avatar-btn">
                  <svg-icon name="add" />
                  <span>添加</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>友链描述</label>
            <textarea 
              v-model="friendForm.description"
              placeholder="请输入友链描述"
              class="description-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>联系邮箱</label>
            <input 
              v-model="friendForm.email"
              type="email"
              placeholder="请输入联系邮箱"
              class="email-input"
            />
          </div>
          
          <div class="form-group">
            <label>友链状态</label>
            <select v-model="friendForm.status" class="status-select">
              <option value="active">正常</option>
              <option value="pending">待审核</option>
              <option value="inactive">已下线</option>
            </select>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">取消</button>
          <button @click="saveFriend" class="save-btn">{{ editingFriend ? '更新' : '添加' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 使用admin布局
definePageMeta({
  layout: 'admin'
})

const router = useRouter()

interface Friend {
  id: number
  name: string
  url: string
  avatar?: string
  description?: string
  email?: string
  status: 'active' | 'pending' | 'inactive'
  createTime: string
}

// 响应式数据
const friends = ref<Friend[]>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const showAddModal = ref(false)
const editingFriend = ref<Friend | null>(null)

// 表单数据
const friendForm = ref({
  name: '',
  url: '',
  avatar: '',
  description: '',
  email: '',
  status: 'active' as 'active' | 'pending' | 'inactive'
})

// 计算属性
const filteredFriends = computed(() => {
  let result = friends.value
  
  if (searchKeyword.value) {
    result = result.filter(friend => 
      friend.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (friend.description && friend.description.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  }
  
  if (statusFilter.value) {
    result = result.filter(friend => friend.status === statusFilter.value)
  }
  
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return result.slice(start, end)
})

const totalPages = computed(() => {
  const total = friends.value.length
  return Math.ceil(total / pageSize)
})

// 方法
const fetchFriends = async () => {
  try {
    // 这里应该调用实际的API获取友链数据
    // 暂时使用模拟数据
    friends.value = [
      {
        id: 1,
        name: 'Vue.js 官网',
        url: 'https://vuejs.org',
        avatar: '/img/default-avatar.png',
        description: 'Vue.js 官方网站，渐进式 JavaScript 框架',
        email: 'contact@vuejs.org',
        status: 'active',
        createTime: '2024-01-15 14:30:00'
      },
      {
        id: 2,
        name: 'Nuxt.js',
        url: 'https://nuxt.com',
        avatar: '/img/default-avatar.png',
        description: 'Nuxt.js 官方网站，Vue.js 全栈框架',
        email: 'hello@nuxt.com',
        status: 'active',
        createTime: '2024-01-14 10:15:00'
      },
      {
        id: 3,
        name: '待审核网站',
        url: 'https://example.com',
        avatar: '/img/default-avatar.png',
        description: '这是一个待审核的友链网站',
        email: 'admin@example.com',
        status: 'pending',
        createTime: '2024-01-13 16:45:00'
      },
      {
        id: 4,
        name: '已下线网站',
        url: 'https://offline.com',
        avatar: '/img/default-avatar.png',
        description: '这是一个已下线的友链网站',
        email: 'contact@offline.com',
        status: 'inactive',
        createTime: '2024-01-12 09:20:00'
      }
    ]
  } catch (error) {
    console.error('获取友链数据失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const getStatusText = (status: string) => {
  const statusMap = {
    active: '正常',
    pending: '待审核',
    inactive: '已下线'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const visitSite = (url: string) => {
  window.open(url, '_blank')
}

const editFriend = (friend: Friend) => {
  editingFriend.value = friend
  friendForm.value = {
    name: friend.name,
    url: friend.url,
    avatar: friend.avatar || '',
    description: friend.description || '',
    email: friend.email || '',
    status: friend.status
  }
  showAddModal.value = true
}

const deleteFriend = async (id: number) => {
  if (confirm('确定要删除这个友链吗？删除后无法恢复！')) {
    try {
      // 这里应该调用实际的API删除友链
      friends.value = friends.value.filter(friend => friend.id !== id)
      console.log('删除友链成功')
    } catch (error) {
      console.error('删除友链失败:', error)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingFriend.value = null
  friendForm.value = {
    name: '',
    url: '',
    avatar: '',
    description: '',
    email: '',
    status: 'active'
  }
}

const addAvatar = () => {
  if (friendForm.value.avatar.trim()) {
    // 验证URL格式
    try {
      new URL(friendForm.value.avatar)
    } catch {
      alert('请输入有效的头像地址')
      return
    }
  }
}

const saveFriend = async () => {
  if (!friendForm.value.name.trim()) {
    alert('请输入友链名称')
    return
  }
  
  if (!friendForm.value.url.trim()) {
    alert('请输入网站地址')
    return
  }
  
  // 验证URL格式
  try {
    new URL(friendForm.value.url)
  } catch {
    alert('请输入有效的网站地址')
    return
  }
  
  try {
    if (editingFriend.value) {
      // 更新友链
      const index = friends.value.findIndex(friend => friend.id === editingFriend.value!.id)
      if (index !== -1) {
        friends.value[index] = {
          ...friends.value[index],
          name: friendForm.value.name,
          url: friendForm.value.url,
          avatar: friendForm.value.avatar,
          description: friendForm.value.description,
          email: friendForm.value.email,
          status: friendForm.value.status
        }
      }
    } else {
      // 新增友链
      const newFriend: Friend = {
        id: Date.now(),
        name: friendForm.value.name,
        url: friendForm.value.url,
        avatar: friendForm.value.avatar,
        description: friendForm.value.description,
        email: friendForm.value.email,
        status: friendForm.value.status,
        createTime: new Date().toISOString()
      }
      friends.value.unshift(newFriend)
    }
    
    closeModal()
    console.log('保存友链成功')
  } catch (error) {
    console.error('保存友链失败:', error)
  }
}

onMounted(() => {
  fetchFriends()
})
</script>

<style lang="less" scoped>
.manage-friend {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h1 {
      margin: 0;
      font-size: 24px;
      color: #262626;
      font-weight: 600;
    }
    
    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #1890ff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      .add-icon {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        background: #40a9ff;
      }
    }
  }
  
  .content-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    .filter-bar {
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      
      .search-box {
        position: relative;
        flex: 1;
        min-width: 200px;
        max-width: 300px;
        
        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          font-size: 14px;
          
          &:focus {
            outline: none;
            border-color: #1890ff;
          }
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #8c8c8c;
        }
      }
      
      .filter-options {
        display: flex;
        gap: 12px;
        
        .status-filter {
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          font-size: 14px;
          
          &:focus {
            outline: none;
            border-color: #1890ff;
          }
        }
      }
    }
    
    .friends-list {
      padding: 20px;
      
      .friend-card {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 20px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        margin-bottom: 16px;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
        }
        
        .friend-avatar {
          flex-shrink: 0;
          
          .avatar-image {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #f0f0f0;
          }
        }
        
        .friend-info {
          flex: 1;
          min-width: 0;
          
          .friend-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            
            .friend-name {
              margin: 0;
              font-size: 18px;
              color: #262626;
              font-weight: 600;
            }
            
            .status {
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              
              &.active {
                background: #f6ffed;
                color: #52c41a;
              }
              
              &.pending {
                background: #fff7e6;
                color: #fa8c16;
              }
              
              &.inactive {
                background: #fff2f0;
                color: #ff4d4f;
              }
            }
          }
          
          .friend-description {
            margin: 0 0 12px;
            font-size: 14px;
            color: #8c8c8c;
            line-height: 1.5;
          }
          
          .friend-details {
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .detail-item {
              display: flex;
              align-items: center;
              font-size: 13px;
              
              .label {
                color: #8c8c8c;
                margin-right: 8px;
                min-width: 50px;
              }
              
              .value {
                color: #262626;
              }
              
              .link {
                color: #1890ff;
                text-decoration: none;
                
                &:hover {
                  text-decoration: underline;
                }
              }
            }
          }
        }
        
        .friend-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
          
          .action-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s ease;
            
            :deep(svg) {
              width: 14px;
              height: 14px;
            }
            
            &.visit {
              background: #52c41a;
              color: white;
              
              &:hover {
                background: #73d13d;
              }
            }
            
            &.edit {
              background: #1890ff;
              color: white;
              
              &:hover {
                background: #40a9ff;
              }
            }
            
            &.delete {
              background: #ff4d4f;
              color: white;
              
              &:hover {
                background: #ff7875;
              }
            }
          }
        }
      }
      
      .empty-state {
        padding: 60px 20px;
        text-align: center;
        color: #8c8c8c;
        
        .empty-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          color: #d9d9d9;
        }
        
        p {
          margin: 0;
          font-size: 16px;
        }
      }
    }
    
    .pagination {
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      border-top: 1px solid #f0f0f0;
      
      .page-btn {
        padding: 6px 12px;
        border: 1px solid #d9d9d9;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover:not(:disabled) {
          border-color: #1890ff;
          color: #1890ff;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
      
      .page-info {
        font-size: 14px;
        color: #8c8c8c;
      }
    }
  }
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h2 {
        margin: 0;
        font-size: 18px;
        color: #262626;
      }
      
      .close-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f5f5f5;
        }
        
        :deep(svg) {
          width: 16px;
          height: 16px;
        }
      }
    }
    
    .modal-body {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
      
      .form-group {
        margin-bottom: 20px;
        
        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #262626;
          font-weight: 500;
        }
        
        .name-input,
        .url-input,
        .email-input,
        .avatar-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          font-size: 14px;
          
          &:focus {
            outline: none;
            border-color: #1890ff;
          }
        }
        
        .description-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
          
          &:focus {
            outline: none;
            border-color: #1890ff;
          }
        }
        
        .status-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          font-size: 14px;
          
          &:focus {
            outline: none;
            border-color: #1890ff;
          }
        }
        
        .avatar-upload {
          .avatar-preview {
            position: relative;
            display: inline-block;
            
            .preview-image {
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 50%;
              border: 2px solid #d9d9d9;
            }
            
            .remove-avatar {
              position: absolute;
              top: -6px;
              right: -6px;
              width: 20px;
              height: 20px;
              background: #ff4d4f;
              color: white;
              border: none;
              border-radius: 50%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              
              :deep(svg) {
                width: 12px;
                height: 12px;
              }
            }
          }
          
          .avatar-input-group {
            display: flex;
            gap: 8px;
            
            .avatar-input {
              flex: 1;
            }
            
            .add-avatar-btn {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 8px 12px;
              background: #1890ff;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.3s ease;
              
              &:hover {
                background: #40a9ff;
              }
              
              :deep(svg) {
                width: 14px;
                height: 14px;
              }
              
              span {
                font-size: 12px;
              }
            }
          }
        }
      }
    }
    
    .modal-footer {
      padding: 20px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      
      .cancel-btn {
        padding: 8px 16px;
        border: 1px solid #d9d9d9;
        background: white;
        color: #262626;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #1890ff;
          color: #1890ff;
        }
      }
      
      .save-btn {
        padding: 8px 16px;
        background: #1890ff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #40a9ff;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .manage-friend {
    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
    
    .content-section {
      .filter-bar {
        flex-direction: column;
        align-items: stretch;
        
        .search-box {
          max-width: none;
        }
      }
      
      .friends-list {
        .friend-card {
          flex-direction: column;
          
          .friend-actions {
            flex-direction: row;
            justify-content: flex-end;
          }
        }
      }
    }
  }
  
  .modal-overlay {
    .modal-content {
      width: 95%;
      margin: 20px;
    }
  }
}
</style>