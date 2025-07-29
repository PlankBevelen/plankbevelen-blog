<template>
    <div class="manage-about">
        <div class="page-header">
        <h1>说说管理</h1>
        <button @click="showTalkDialog" class="add-btn">
            <svg-icon name="add" class="add-icon" size="16px"/>
            <span>发布说说</span>
        </button>
        </div>
        
        <div class="content-section">
            <div class="filter-bar">
                <el-input 
                v-model="searchKeyword" 
                type="text" 
                placeholder="搜索说说内容..."
                :prefix-icon="Search"
                @input="handleSearch"
                @clear="handleSearch"
                clearable
                />

                <el-select v-model="statusFilter" placeholder="全部状态" @change="handleStatusFilter" @clear="handleStatusFilter" clearable>
                    <el-option label="全部状态" value=""></el-option>
                    <el-option label="已发布" value="published"></el-option>
                    <el-option label="草稿" value="draft"></el-option>
                </el-select>
            </div>
        
            <div class="talks-list">
                <div v-for="talk in filteredTalks" :key="talk.id" class="talk-item">
                <div class="talk-content">
                    <p class="talk-text">{{ talk.content }}</p>
                    <div v-if="talk.images?.length" class="talk-images">
                    <img 
                        v-for="(image, index) in talk.images" 
                        :key="index"
                        :src="image" 
                        :alt="`图片${index + 1}`"
                        class="talk-image"
                    />
                    </div>
                </div>
                
                <div class="talk-meta">
                    <div class="meta-info">
                    <span class="publish-time">{{ formatTime(talk.createTime) }}</span>
                    <span class="status" :class="talk.status">{{ getStatusText(talk.status) }}</span>
                    <span class="stats">
                        <svg-icon name="like" class="stat-icon" />
                        {{ talk.likeCount || 0 }}
                    </span>
                    <span class="stats">
                        <svg-icon name="comment" class="stat-icon" />
                        {{ talk.commentCount || 0 }}
                    </span>
                    </div>
                    
                    <div class="actions">
                    <button @click="editTalk(talk)" class="action-btn edit">
                        <svg-icon name="edit" color="#007AFF"/>
                        <span>编辑</span>
                    </button>
                    <button @click="deleteTalk(talk.id)" class="action-btn delete">
                        <svg-icon name="delete" color="#FF4D4F"/>
                        <span>删除</span>
                    </button>
                    </div>
                </div>
                </div>
                
                <div v-if="!filteredTalks.length" class="empty-state">
                <svg-icon name="empty" class="empty-icon" />
                <p>暂无说说数据</p>
                </div>
            </div>
        
            <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalCount"
                layout="prev, pager, next, jumper, total"
                class="pagination"
                @current-change="handlePageChange"
            />
        </div>
        
        <!-- 添加/编辑说说弹窗 -->
        <el-dialog v-model="showAddModal" class="talk-dialog" center width="42%">
            <template #header>
                <h2>{{ editingTalk ? '编辑说说' : '发布说说' }}</h2>
            </template>
            <el-form :model="talkForm" :rules="talkFormRules" ref="talkFormRef" class="dialog-form">
                <el-form-item label="说说内容" prop="content">
                    <el-input 
                    v-model="talkForm.content" 
                    type="textarea" 
                    :autosize="{ minRows: 2, maxRows: 4 }" 
                    placeholder="分享你的想法..."
                    />
                </el-form-item>
                <el-form-item label="说说状态" prop="status">
                    <el-select v-model="talkForm.status" placeholder="请选择状态">
                        <el-option label="已发布" value="published"></el-option>
                        <el-option label="草稿" value="draft"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="说说图片">
                    <div class="upload-container">
                        <el-upload
                            class="image-uploader"
                            action="#"
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleImageChange"
                            accept="image/*"
                            multiple
                        >
                            <el-button type="primary" :icon="Plus">上传图片</el-button>
                        </el-upload>
                        
                        <div v-if="talkForm.images.length" class="image-preview-list">
                            <div v-for="(image, index) in talkForm.images" :key="index" class="image-preview-item">
                                <img :src="image" :alt="`图片${index + 1}`" class="preview-image" @click="previewImage(image)" />
                                <div class="image-overlay">
                                    <el-button 
                                        type="info" 
                                        size="small" 
                                        :icon="ZoomIn" 
                                        circle 
                                        @click="previewImage(image)"
                                        class="preview-btn"
                                    />
                                    <el-button 
                                        type="danger" 
                                        size="small" 
                                        :icon="Delete" 
                                        circle 
                                        @click="removeImage(index)"
                                        class="delete-btn"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button type="warning" @click="closeModal">
                    取消
                </el-button>
                <el-button type="primary" @click="saveTalk">
                    保存
                </el-button>
            </template>
        </el-dialog>
        
        <!-- 图片预览弹窗 -->
        <el-dialog v-model="showImagePreview" class="image-preview-dialog" center>
            <img :src="previewImageUrl" alt="预览图片" class="preview-full-image" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Delete, ZoomIn } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import talkService from '~/services/talkService'

definePageMeta({
  layout: 'admin'
})

interface Talk {
  id: number
  content: string
  images?: string[]
  status: 'published' | 'draft'
  createTime: string
  likeCount?: number
  commentCount?: number
}

// 响应式数据
const talks = ref<Talk[]>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10

// 分页变化处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchTalks()
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchTalks()
}

// 状态筛选处理
const handleStatusFilter = () => {
  currentPage.value = 1
  fetchTalks()
}

const showAddModal = ref(false)
const editingTalk = ref<Talk | null>(null)
const showImagePreview = ref(false)
const previewImageUrl = ref('')

// 表单数据
const talkForm = ref({
  content: '',
  images: [] as string[],
  status: 'published' as 'published' | 'draft'
})
const talkFormRef = null;
const talkFormRules = ref({
  content: [{ required: true, message: '请输入说说内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择说说状态', trigger: 'change' }]
})

// 计算属性
const filteredTalks = computed(() => {
    let result = talks.value
    
    if (searchKeyword.value) {
        result = result.filter(talk => 
        talk.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
    }
    
    if (statusFilter.value) {
        result = result.filter(talk => talk.status === statusFilter.value)
    }
  
    return result
})

const totalCount = computed(() => {
    return filteredTalks.value.length
})

// 获取所有说说
const fetchTalks = async () => {
    try {
        talkService.getAllTalks().then( (res) => {
            const rawTalks = res.data[0]
            console.log(rawTalks)
            talks.value = rawTalks.map((talk: any) => ({
                id: talk.id,
                content: talk.content,
                images: talk.images ? JSON.parse(talk.images) : [],
                status: talk.status,
                createTime: talk.created_at,
                likeCount: talk.like_count,
                commentCount: talk.comment_count,
            }))
        })
    } catch (error) {
        console.error('获取说说数据失败:', error)
        ElMessage.error('获取说说失败')
    }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const getStatusText = (status: string) => {
  return status === 'published' ? '已发布' : '草稿'
}

// 重置talkForm
const resetTalkForm = () => {
  talkForm.value = {
    content: '',
    images: [],
    status: 'published'
  }
}

// 显示说说弹窗
const showTalkDialog = () => {
    resetTalkForm()
    showAddModal.value = true
    editingTalk.value = null
}

// 编辑说说
const editTalk = (talk: Talk) => {
  editingTalk.value = talk
  talkForm.value = {
    content: talk.content,
    images: [...(talk.images || [])],
    status: talk.status
  }
  showAddModal.value = true
}

// 删除说说
const deleteTalk = async (id: number) => {
    // 询问是否确认删除
    const confirmDelete = confirm('确定要删除这条说说吗？')
    if (!confirmDelete) {
      return
    }
    talkService.delete(id).then((res) => {
        fetchTalks()
        ElMessage.success('删除成功')
    }).catch((err) => {
        ElMessage.error('删除失败')
    })
}

// 关闭模态框
const closeModal = () => {
  showAddModal.value = false
  editingTalk.value = null
  talkForm.value = {
    content: '',
    images: [],
    status: 'published'
  }
}

// 处理图片上传
const handleImageChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      talkForm.value.images.push(e.target.result as string)
    }
  }
  reader.readAsDataURL(file.raw)
}

// 预览图片
const previewImage = (imageUrl: string) => {
    previewImageUrl.value = imageUrl
    showImagePreview.value = true
}

// 移除图片
const removeImage = (index: number) => {
  talkForm.value.images.splice(index, 1)
}

// 保存说说
const saveTalk = async () => {
  if (!talkForm.value.content.trim()) {
    ElMessage.error("输入说说内容")
    return
  }
  
  try {
    // images如果不为空， 转为json格式
    let imagesJson: string | null = null;
    if (talkForm.value.images.length > 0) {
      imagesJson = JSON.stringify(talkForm.value.images);
    }
    if (editingTalk.value) {
      // 更新说说
      const index = talks.value.findIndex(talk => talk.id === editingTalk.value!.id)
      if (index !== -1) {
        talks.value[index] = {
          ...talks.value[index],
          content: talkForm.value.content,
          images: [...talkForm.value.images],
          status: talkForm.value.status
        }
      }
      talkService.update(editingTalk.value.id, talkForm.value.content, talkForm.value.status, imagesJson).then((res) => {
        fetchTalks()
        ElMessage.success('更新成功')
      })
    } else {
      // 新增说说
      talkService.publish(talkForm.value.content, talkForm.value.status, imagesJson).then((res) => {
        fetchTalks()
        ElMessage.success('发布成功')
      })
    }
    
    closeModal()
    console.log('保存说说成功')
  } catch (error) {
    console.error('保存说说失败:', error)
  }
}

onMounted(() => {
  fetchTalks()
})
</script>

<style lang="less" scoped>
.manage-about {
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
            gap: 4px;
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
            display: inline-flex;
            gap: 16px;
            align-items: center;

            .el-input {
                min-width: 260px;
            }

            .el-button {
                color: #fff;
                background-color: #1890ff;
                border-color: #1890ff;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
            }

            .el-select {
                min-width: 120px;
            }
        }
        
        .talks-list {
            .talk-item {
                padding: 20px;
                border-bottom: 1px solid #f0f0f0;
                
                &:last-child {
                    border-bottom: none;
                }
            
                .talk-content {
                    margin-bottom: 16px;
                
                    .talk-text {
                        margin: 0 0 12px;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #262626;
                    }
                    
                    .talk-images {
                        display: flex;
                        gap: 8px;
                        flex-wrap: wrap;
                        
                        .talk-image {
                            width: 80px;
                            height: 80px;
                            object-fit: cover;
                            border-radius: 6px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        
                            &:hover {
                                transform: scale(1.05);
                            }
                        }
                    }
                }
                
                .talk-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                
                .meta-info {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    font-size: 14px;
                    color: #8c8c8c;
                    
                    .status {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    
                    &.published {
                        background: #f6ffed;
                        color: #52c41a;
                    }
                    
                    &.draft {
                        background: #fff7e6;
                        color: #fa8c16;
                    }
                    }
                    
                    .stats {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    
                    .stat-icon {
                        width: 14px;
                        height: 14px;
                    }
                    }
                }
                
                .actions {
                    display: flex;
                    gap: 8px;
                    
                    .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border: 1px solid #d9d9d9;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                    
                    :deep(svg) {
                        width: 12px;
                        height: 12px;
                    }
                    
                    &.edit {
                        color: #1890ff;
                        border-color: #1890ff;
                        
                        &:hover {
                        background: #f0f9ff;
                        }
                    }
                    
                    &.delete {
                        color: #ff4d4f;
                        border-color: #ff4d4f;
                        
                        &:hover {
                        background: #fff2f0;
                        }
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
            border-top: 1px solid #f0f0f0;
        }
    }
}

// 弹窗样式需要在全局作用域中定义
:deep(.el-dialog) {
    .el-dialog__header {
        padding: 20px ;
        
        h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #262626;
        }
    }
  
    .el-dialog__body {
        padding: 20px;
        width: 75%;
        margin: 0 auto;
    }

    .el-dialog__footer {
        text-align: right;
        padding: 0 20px;
    }
  
    .dialog-form {
        .el-form-item {
            margin-bottom: 40px;
        }

        .el-form-item__label {
            font-weight: 500;
            color: #262626;
        }
    
        .el-textarea__inner {
            border-radius: 6px;
        
            &:focus {
                border-color: #1890ff;
                box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
            }
        }
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 0;
}

.upload-container {
  .image-uploader {
    margin-bottom: 16px;
  }
  
  .image-preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    
    .image-preview-item {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #d9d9d9;
      
      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      
      .image-overlay {
         position: absolute;
         top: 0;
         left: 0;
         right: 0;
         bottom: 0;
         background: rgba(0, 0, 0, 0.5);
         display: flex;
         align-items: center;
         justify-content: center;
         gap: 8px;
         opacity: 0;
         transition: opacity 0.3s ease;
         
         .preview-btn {
           background: rgba(64, 169, 255, 0.8);
           border-color: transparent;
           
           &:hover {
             background: #1890ff;
           }
         }
         
         .delete-btn {
           background: rgba(255, 77, 79, 0.8);
           border-color: transparent;
           
           &:hover {
             background: #ff4d4f;
           }
         }
       }
      
      &:hover .image-overlay {
         opacity: 1;
       }
       
       .preview-image {
         cursor: pointer;
         transition: transform 0.2s ease;
         
         &:hover {
           transform: scale(1.05);
         }
       }
     }
   }
}

.image-preview-dialog {
    .el-dialog {
        max-width: 90vw;
        max-height: 90vh;
    }

    .el-dialog__body {
        padding: 0;
        text-align: center;
    }

    .preview-full-image {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 8px;
    }
}

</style>