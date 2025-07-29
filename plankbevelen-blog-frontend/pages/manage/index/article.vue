<template>
  <div class="manage-article">
    <div class="page-header">
      <h1>文章管理</h1>
      <button @click="showAddModal = true" class="add-btn">
        <svg-icon name="add" class="add-icon" />
        <span>新建文章</span>
      </button>
    </div>
    
    <div class="content-section">
      <div class="filter-bar">
        <div class="search-box">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索文章标题或内容..."
            class="search-input"
          />
          <svg-icon name="search" class="search-icon" />
        </div>
        
        <div class="filter-options">
          <select v-model="statusFilter" class="status-filter">
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
          
          <select v-model="categoryFilter" class="category-filter">
            <option value="">全部分类</option>
            <option value="tech">技术</option>
            <option value="life">生活</option>
            <option value="travel">旅行</option>
          </select>
        </div>
      </div>
      
      <div class="articles-list">
        <div v-for="article in filteredArticles" :key="article.id" class="article-item">
          <div class="article-cover">
            <img 
              :src="article.cover || '/img/default-avatar.png'" 
              :alt="article.title"
              class="cover-image"
            />
          </div>
          
          <div class="article-content">
            <div class="article-header">
              <h3 class="article-title">{{ article.title }}</h3>
              <div class="article-meta">
                <span class="category">{{ getCategoryText(article.category) }}</span>
                <span class="status" :class="article.status">{{ getStatusText(article.status) }}</span>
              </div>
            </div>
            
            <p class="article-summary">{{ article.summary }}</p>
            
            <div class="article-stats">
              <span class="stat-item">
                <svg-icon name="view" class="stat-icon" />
                {{ article.viewCount || 0 }} 阅读
              </span>
              <span class="stat-item">
                <svg-icon name="like" class="stat-icon" />
                {{ article.likeCount || 0 }} 点赞
              </span>
              <span class="stat-item">
                <svg-icon name="comment" class="stat-icon" />
                {{ article.commentCount || 0 }} 评论
              </span>
              <span class="publish-time">{{ formatTime(article.createTime) }}</span>
            </div>
          </div>
          
          <div class="article-actions">
            <button @click="editArticle(article)" class="action-btn edit">
              <svg-icon name="edit" />
              <span>编辑</span>
            </button>
            <button @click="viewArticle(article.id)" class="action-btn view">
              <svg-icon name="view" />
              <span>预览</span>
            </button>
            <button @click="deleteArticle(article.id)" class="action-btn delete">
              <svg-icon name="delete" />
              <span>删除</span>
            </button>
          </div>
        </div>
        
        <div v-if="!filteredArticles.length" class="empty-state">
          <svg-icon name="empty" class="empty-icon" />
          <p>暂无文章数据</p>
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
    
    <!-- 添加/编辑文章弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingArticle ? '编辑文章' : '新建文章' }}</h2>
          <button @click="closeModal" class="close-btn">
            <svg-icon name="close" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>文章标题</label>
              <input 
                v-model="articleForm.title"
                type="text"
                placeholder="请输入文章标题"
                class="title-input"
              />
            </div>
            
            <div class="form-group">
              <label>分类</label>
              <select v-model="articleForm.category" class="category-select">
                <option value="tech">技术</option>
                <option value="life">生活</option>
                <option value="travel">旅行</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>文章摘要</label>
            <textarea 
              v-model="articleForm.summary"
              placeholder="请输入文章摘要"
              class="summary-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>封面图片</label>
            <div class="cover-upload">
              <div v-if="articleForm.cover" class="cover-preview">
                <img :src="articleForm.cover" alt="封面预览" class="preview-image" />
                <button @click="articleForm.cover = ''" class="remove-cover">
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
            <label>文章内容</label>
            <textarea 
              v-model="articleForm.content"
              placeholder="请输入文章内容（支持Markdown）"
              class="content-textarea"
              rows="10"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>标签</label>
              <input 
                v-model="articleForm.tags"
                type="text"
                placeholder="请输入标签，用逗号分隔"
                class="tags-input"
              />
            </div>
            
            <div class="form-group">
              <label>状态</label>
              <select v-model="articleForm.status" class="status-select">
                <option value="published">发布</option>
                <option value="draft">保存为草稿</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">取消</button>
          <button @click="saveArticle" class="save-btn">{{ editingArticle ? '更新' : '发布' }}</button>
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

interface Article {
  id: number
  title: string
  summary: string
  content: string
  cover?: string
  category: string
  tags: string[]
  status: 'published' | 'draft'
  createTime: string
  viewCount?: number
  likeCount?: number
  commentCount?: number
}

// 响应式数据
const articles = ref<Article[]>([])
const searchKeyword = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const showAddModal = ref(false)
const editingArticle = ref<Article | null>(null)

// 表单数据
const articleForm = ref({
  title: '',
  summary: '',
  content: '',
  cover: '',
  category: 'tech',
  tags: '',
  status: 'published' as 'published' | 'draft'
})

// 计算属性
const filteredArticles = computed(() => {
  let result = articles.value
  
  if (searchKeyword.value) {
    result = result.filter(article => 
      article.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (statusFilter.value) {
    result = result.filter(article => article.status === statusFilter.value)
  }
  
  if (categoryFilter.value) {
    result = result.filter(article => article.category === categoryFilter.value)
  }
  
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return result.slice(start, end)
})

const totalPages = computed(() => {
  const total = articles.value.length
  return Math.ceil(total / pageSize)
})

// 方法
const fetchArticles = async () => {
  try {
    // 这里应该调用实际的API获取文章数据
    // 暂时使用模拟数据
    articles.value = [
      {
        id: 1,
        title: 'Vue3 + Nuxt3 开发实践',
        summary: '分享使用Vue3和Nuxt3开发现代Web应用的经验和技巧',
        content: '# Vue3 + Nuxt3 开发实践\n\n这是一篇关于Vue3和Nuxt3开发的文章...',
        cover: '/img/default-avatar.png',
        category: 'tech',
        tags: ['Vue3', 'Nuxt3', '前端'],
        status: 'published',
        createTime: '2024-01-15 14:30:00',
        viewCount: 256,
        likeCount: 18,
        commentCount: 5
      },
      {
        id: 2,
        title: '生活随笔：关于工作与生活的平衡',
        summary: '在快节奏的现代生活中，如何平衡工作与生活的关系',
        content: '# 生活随笔\n\n关于工作与生活的平衡...',
        category: 'life',
        tags: ['生活', '感悟'],
        status: 'published',
        createTime: '2024-01-14 10:15:00',
        viewCount: 128,
        likeCount: 12,
        commentCount: 3
      },
      {
        id: 3,
        title: '草稿文章：待完善的技术分享',
        summary: '这是一篇还在编写中的技术文章',
        content: '# 草稿文章\n\n内容待完善...',
        category: 'tech',
        tags: ['草稿'],
        status: 'draft',
        createTime: '2024-01-13 16:45:00',
        viewCount: 0,
        likeCount: 0,
        commentCount: 0
      }
    ]
  } catch (error) {
    console.error('获取文章数据失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const getStatusText = (status: string) => {
  return status === 'published' ? '已发布' : '草稿'
}

const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    tech: '技术',
    life: '生活',
    travel: '旅行'
  }
  return categoryMap[category] || category
}

const editArticle = (article: Article) => {
  editingArticle.value = article
  articleForm.value = {
    title: article.title,
    summary: article.summary,
    content: article.content,
    cover: article.cover || '',
    category: article.category,
    tags: article.tags.join(', '),
    status: article.status
  }
  showAddModal.value = true
}

const viewArticle = (id: number) => {
  // 这里应该跳转到文章详情页面
  console.log('预览文章:', id)
}

const deleteArticle = async (id: number) => {
  if (confirm('确定要删除这篇文章吗？')) {
    try {
      // 这里应该调用实际的API删除文章
      articles.value = articles.value.filter(article => article.id !== id)
      console.log('删除文章成功')
    } catch (error) {
      console.error('删除文章失败:', error)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingArticle.value = null
  articleForm.value = {
    title: '',
    summary: '',
    content: '',
    cover: '',
    category: 'tech',
    tags: '',
    status: 'published'
  }
}

const addCover = () => {
  // 这里应该实现图片上传功能
  const imageUrl = prompt('请输入封面图片URL:')
  if (imageUrl) {
    articleForm.value.cover = imageUrl
  }
}

const saveArticle = async () => {
  if (!articleForm.value.title.trim()) {
    alert('请输入文章标题')
    return
  }
  
  if (!articleForm.value.content.trim()) {
    alert('请输入文章内容')
    return
  }
  
  try {
    const tags = articleForm.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    
    if (editingArticle.value) {
      // 更新文章
      const index = articles.value.findIndex(article => article.id === editingArticle.value!.id)
      if (index !== -1) {
        articles.value[index] = {
          ...articles.value[index],
          title: articleForm.value.title,
          summary: articleForm.value.summary,
          content: articleForm.value.content,
          cover: articleForm.value.cover,
          category: articleForm.value.category,
          tags,
          status: articleForm.value.status
        }
      }
    } else {
      // 新增文章
      const newArticle: Article = {
        id: Date.now(),
        title: articleForm.value.title,
        summary: articleForm.value.summary,
        content: articleForm.value.content,
        cover: articleForm.value.cover,
        category: articleForm.value.category,
        tags,
        status: articleForm.value.status,
        createTime: new Date().toISOString(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0
      }
      articles.value.unshift(newArticle)
    }
    
    closeModal()
    console.log('保存文章成功')
  } catch (error) {
    console.error('保存文章失败:', error)
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style lang="less" scoped>
.manage-article {
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
        
        .status-filter,
        .category-filter {
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
    
    .articles-list {
      .article-item {
        padding: 20px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        gap: 16px;
        
        &:last-child {
          border-bottom: none;
        }
        
        .article-cover {
          flex-shrink: 0;
          
          .cover-image {
            width: 120px;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #f0f0f0;
          }
        }
        
        .article-content {
          flex: 1;
          
          .article-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
            
            .article-title {
              margin: 0;
              font-size: 18px;
              color: #262626;
              font-weight: 600;
              line-height: 1.4;
            }
            
            .article-meta {
              display: flex;
              gap: 8px;
              align-items: center;
              
              .category {
                padding: 2px 8px;
                background: #f0f9ff;
                color: #1890ff;
                border-radius: 4px;
                font-size: 12px;
              }
              
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
            }
          }
          
          .article-summary {
            margin: 0 0 12px;
            font-size: 14px;
            color: #8c8c8c;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .article-stats {
            display: flex;
            gap: 16px;
            align-items: center;
            font-size: 12px;
            color: #8c8c8c;
            
            .stat-item {
              display: flex;
              align-items: center;
              gap: 4px;
              
              .stat-icon {
                width: 12px;
                height: 12px;
              }
            }
            
            .publish-time {
              margin-left: auto;
            }
          }
        }
        
        .article-actions {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 6px 12px;
            border: 1px solid #d9d9d9;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s ease;
            min-width: 60px;
            
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
            
            &.view {
              color: #52c41a;
              border-color: #52c41a;
              
              &:hover {
                background: #f6ffed;
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
    max-width: 800px;
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
      
      .form-row {
        display: flex;
        gap: 16px;
        
        .form-group {
          flex: 1;
        }
      }
      
      .form-group {
        margin-bottom: 20px;
        
        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #262626;
          font-weight: 500;
        }
        
        .title-input,
        .tags-input {
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
        
        .summary-textarea,
        .content-textarea {
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
        
        .category-select,
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
  .manage-article {
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
        
        .filter-options {
          flex-direction: column;
        }
      }
      
      .articles-list {
        .article-item {
          flex-direction: column;
          
          .article-cover {
            align-self: center;
          }
          
          .article-content {
            .article-header {
              flex-direction: column;
              gap: 8px;
              align-items: flex-start;
            }
            
            .article-stats {
              flex-wrap: wrap;
              
              .publish-time {
                margin-left: 0;
              }
            }
          }
          
          .article-actions {
            flex-direction: row;
            justify-content: center;
          }
        }
      }
    }
  }
  
  .modal-overlay {
    .modal-content {
      width: 95%;
      margin: 20px;
      
      .modal-body {
        .form-row {
          flex-direction: column;
        }
      }
    }
  }
}
</style>