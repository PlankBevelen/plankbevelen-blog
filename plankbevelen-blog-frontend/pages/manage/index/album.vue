<template>
  <div class="manage-album">
    <div class="page-header">
      <h1>相册管理</h1>
      <button @click="showAddModal = true" class="add-btn">
        <svg-icon name="add" class="add-icon" />
        <span>新建相册</span>
      </button>
    </div>
    
    <div class="content-section">
      <div class="filter-bar">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索相册名称或描述..."
            class="search-input"
          />
          <svg-icon name="search" class="search-icon" />
        </div>
        
        <div class="filter-options">
          <select v-model="statusFilter" class="status-filter">
            <option value="">全部状态</option>
            <option value="public">公开</option>
            <option value="private">私密</option>
          </select>
        </div>
      </div>
      
      <div class="albums-grid">
        <div v-for="album in filteredAlbums" :key="album.id" class="album-card">
          <div class="album-cover">
            <img 
              :src="album.cover || '/img/default-avatar.png'" 
              :alt="album.name"
              class="cover-image"
            />
            <div class="album-overlay">
              <div class="photo-count">{{ album.photoCount || 0 }} 张照片</div>
              <div class="album-actions">
                <button @click="viewAlbum(album.id)" class="action-btn view">
                  <svg-icon name="view" />
                </button>
                <button @click="editAlbum(album)" class="action-btn edit">
                  <svg-icon name="edit" />
                </button>
                <button @click="deleteAlbum(album.id)" class="action-btn delete">
                  <svg-icon name="delete" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="album-info">
            <h3 class="album-name">{{ album.name }}</h3>
            <p class="album-description">{{ album.description || '暂无描述' }}</p>
            
            <div class="album-meta">
              <span class="status" :class="album.status">{{ getStatusText(album.status) }}</span>
              <span class="create-time">{{ formatTime(album.createTime) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="!filteredAlbums.length" class="empty-state">
          <svg-icon name="empty" class="empty-icon" />
          <p>暂无相册数据</p>
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
    
    <!-- 添加/编辑相册弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingAlbum ? '编辑相册' : '新建相册' }}</h2>
          <button @click="closeModal" class="close-btn">
            <svg-icon name="close" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>相册名称</label>
            <input 
              v-model="albumForm.name"
              type="text"
              placeholder="请输入相册名称"
              class="name-input"
            />
          </div>
          
          <div class="form-group">
            <label>相册描述</label>
            <textarea 
              v-model="albumForm.description"
              placeholder="请输入相册描述"
              class="description-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>封面图片</label>
            <div class="cover-upload">
              <div v-if="albumForm.cover" class="cover-preview">
                <img :src="albumForm.cover" alt="封面预览" class="preview-image" />
                <button @click="albumForm.cover = ''" class="remove-cover">
                  <svg-icon name="close" />
                </button>
              </div>
              <button v-else @click="addCover" class="add-cover-btn">
                <svg-icon name="add" />
                <span>添加封面</span>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>相册状态</label>
            <select v-model="albumForm.status" class="status-select">
              <option value="public">公开</option>
              <option value="private">私密</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>照片上传</label>
            <div class="photos-upload">
              <div class="photos-grid">
                <div v-for="(photo, index) in albumForm.photos" :key="index" class="photo-item">
                  <img :src="photo" alt="照片" class="photo-image" />
                  <button @click="removePhoto(index)" class="remove-photo">
                    <svg-icon name="close" />
                  </button>
                </div>
                <button @click="addPhoto" class="add-photo-btn">
                  <svg-icon name="add" />
                  <span>添加照片</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">取消</button>
          <button @click="saveAlbum" class="save-btn">{{ editingAlbum ? '更新' : '创建' }}</button>
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

interface Album {
  id: number
  name: string
  description?: string
  cover?: string
  status: 'public' | 'private'
  createTime: string
  photoCount?: number
  photos?: string[]
}

// 响应式数据
const albums = ref<Album[]>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 12
const showAddModal = ref(false)
const editingAlbum = ref<Album | null>(null)

// 表单数据
const albumForm = ref({
  name: '',
  description: '',
  cover: '',
  status: 'public' as 'public' | 'private',
  photos: [] as string[]
})

// 计算属性
const filteredAlbums = computed(() => {
  let result = albums.value
  
  if (searchKeyword.value) {
    result = result.filter(album => 
      album.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (album.description && album.description.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  }
  
  if (statusFilter.value) {
    result = result.filter(album => album.status === statusFilter.value)
  }
  
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return result.slice(start, end)
})

const totalPages = computed(() => {
  const total = albums.value.length
  return Math.ceil(total / pageSize)
})

// 方法
const fetchAlbums = async () => {
  try {
    // 这里应该调用实际的API获取相册数据
    // 暂时使用模拟数据
    albums.value = [
      {
        id: 1,
        name: '旅行回忆',
        description: '记录美好的旅行时光',
        cover: '/img/default-avatar.png',
        status: 'public',
        createTime: '2024-01-15 14:30:00',
        photoCount: 25,
        photos: ['/img/default-avatar.png', '/img/default-avatar.png']
      },
      {
        id: 2,
        name: '生活随拍',
        description: '日常生活中的美好瞬间',
        cover: '/img/default-avatar.png',
        status: 'public',
        createTime: '2024-01-14 10:15:00',
        photoCount: 18,
        photos: ['/img/default-avatar.png']
      },
      {
        id: 3,
        name: '私人相册',
        description: '私密照片收藏',
        cover: '/img/default-avatar.png',
        status: 'private',
        createTime: '2024-01-13 16:45:00',
        photoCount: 12,
        photos: []
      }
    ]
  } catch (error) {
    console.error('获取相册数据失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const getStatusText = (status: string) => {
  return status === 'public' ? '公开' : '私密'
}

const viewAlbum = (id: number) => {
  // 这里应该跳转到相册详情页面
  console.log('查看相册:', id)
}

const editAlbum = (album: Album) => {
  editingAlbum.value = album
  albumForm.value = {
    name: album.name,
    description: album.description || '',
    cover: album.cover || '',
    status: album.status,
    photos: album.photos || []
  }
  showAddModal.value = true
}

const deleteAlbum = async (id: number) => {
  if (confirm('确定要删除这个相册吗？删除后无法恢复！')) {
    try {
      // 这里应该调用实际的API删除相册
      albums.value = albums.value.filter(album => album.id !== id)
      console.log('删除相册成功')
    } catch (error) {
      console.error('删除相册失败:', error)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingAlbum.value = null
  albumForm.value = {
    name: '',
    description: '',
    cover: '',
    status: 'public',
    photos: []
  }
}

const addCover = () => {
  // 这里应该实现图片上传功能
  const imageUrl = prompt('请输入封面图片URL:')
  if (imageUrl) {
    albumForm.value.cover = imageUrl
  }
}

const addPhoto = () => {
  // 这里应该实现图片上传功能
  const imageUrl = prompt('请输入照片URL:')
  if (imageUrl) {
    albumForm.value.photos.push(imageUrl)
  }
}

const removePhoto = (index: number) => {
  albumForm.value.photos.splice(index, 1)
}

const saveAlbum = async () => {
  if (!albumForm.value.name.trim()) {
    alert('请输入相册名称')
    return
  }
  
  try {
    if (editingAlbum.value) {
      // 更新相册
      const index = albums.value.findIndex(album => album.id === editingAlbum.value!.id)
      if (index !== -1) {
        albums.value[index] = {
          ...albums.value[index],
          name: albumForm.value.name,
          description: albumForm.value.description,
          cover: albumForm.value.cover,
          status: albumForm.value.status,
          photos: albumForm.value.photos,
          photoCount: albumForm.value.photos.length
        }
      }
    } else {
      // 新增相册
      const newAlbum: Album = {
        id: Date.now(),
        name: albumForm.value.name,
        description: albumForm.value.description,
        cover: albumForm.value.cover,
        status: albumForm.value.status,
        createTime: new Date().toISOString(),
        photos: albumForm.value.photos,
        photoCount: albumForm.value.photos.length
      }
      albums.value.unshift(newAlbum)
    }
    
    closeModal()
    console.log('保存相册成功')
  } catch (error) {
    console.error('保存相册失败:', error)
  }
}

onMounted(() => {
  fetchAlbums()
})
</script>

<style lang="less" scoped>
.manage-album {
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
    
    .albums-grid {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      
      .album-card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          
          .album-overlay {
            opacity: 1;
          }
        }
        
        .album-cover {
          position: relative;
          height: 200px;
          overflow: hidden;
          
          .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .album-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 12px;
            opacity: 0;
            transition: all 0.3s ease;
            
            .photo-count {
              color: white;
              font-size: 14px;
              font-weight: 500;
            }
            
            .album-actions {
              display: flex;
              gap: 8px;
              justify-content: flex-end;
              
              .action-btn {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                
                :deep(svg) {
                  width: 16px;
                  height: 16px;
                }
                
                &.view {
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
        }
        
        .album-info {
          padding: 16px;
          
          .album-name {
            margin: 0 0 8px;
            font-size: 16px;
            color: #262626;
            font-weight: 600;
            line-height: 1.4;
          }
          
          .album-description {
            margin: 0 0 12px;
            font-size: 14px;
            color: #8c8c8c;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .album-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            
            .status {
              padding: 2px 8px;
              border-radius: 4px;
              
              &.public {
                background: #f6ffed;
                color: #52c41a;
              }
              
              &.private {
                background: #fff7e6;
                color: #fa8c16;
              }
            }
            
            .create-time {
              color: #8c8c8c;
            }
          }
        }
      }
      
      .empty-state {
        grid-column: 1 / -1;
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
    max-width: 600px;
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
        
        .name-input {
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
        
        .cover-upload {
          .cover-preview {
            position: relative;
            display: inline-block;
            
            .preview-image {
              width: 120px;
              height: 80px;
              object-fit: cover;
              border-radius: 6px;
              border: 1px solid #d9d9d9;
            }
            
            .remove-cover {
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
          
          .add-cover-btn {
            width: 120px;
            height: 80px;
            border: 2px dashed #d9d9d9;
            background: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: #8c8c8c;
            transition: all 0.3s ease;
            
            &:hover {
              border-color: #1890ff;
              color: #1890ff;
            }
            
            :deep(svg) {
              width: 20px;
              height: 20px;
            }
            
            span {
              font-size: 12px;
            }
          }
        }
        
        .photos-upload {
          .photos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 8px;
            
            .photo-item {
              position: relative;
              
              .photo-image {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 4px;
                border: 1px solid #d9d9d9;
              }
              
              .remove-photo {
                position: absolute;
                top: -4px;
                right: -4px;
                width: 16px;
                height: 16px;
                background: #ff4d4f;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                
                :deep(svg) {
                  width: 8px;
                  height: 8px;
                }
              }
            }
            
            .add-photo-btn {
              width: 80px;
              height: 80px;
              border: 2px dashed #d9d9d9;
              background: none;
              border-radius: 4px;
              cursor: pointer;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 2px;
              color: #8c8c8c;
              transition: all 0.3s ease;
              
              &:hover {
                border-color: #1890ff;
                color: #1890ff;
              }
              
              :deep(svg) {
                width: 16px;
                height: 16px;
              }
              
              span {
                font-size: 10px;
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
  .manage-album {
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
      
      .albums-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }
  }
  
  .modal-overlay {
    .modal-content {
      width: 95%;
      margin: 20px;
      
      .modal-body {
        .photos-upload {
          .photos-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            
            .photo-item .photo-image,
            .add-photo-btn {
              width: 60px;
              height: 60px;
            }
          }
        }
      }
    }
  }
}
</style>