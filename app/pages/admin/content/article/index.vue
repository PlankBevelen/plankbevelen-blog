<template>
    <div class="article">
        <div class="header">
            <h2 class="title">文章管理</h2>
        </div>

        <el-card shadow="hover" class="article-card">
            <template #header>
                <div class="card-header-content">
                    <div class="search-area">
                        <el-input 
                            placeholder="搜索文章标题、分类、标签" 
                            v-model="searchText" 
                            clearable 
                            prefix-icon="Search"
                            class="search-input"
                            @keyup.enter="onSearch"
                        ></el-input>
                    </div>
                    <div class="actions">
                        <el-button type="primary" icon="Plus" @click="handleEdit('add')">新增文章</el-button>
                    </div>
                </div>
            </template>
            <div class="article-content">
                <el-table :data="articleList" style="width: 100%" :header-cell-style="{ background: 'var(--bg-color)', color: 'var(--text-color)' }">
                    <el-table-column prop="title" label="文章标题" min-width="200" show-overflow-tooltip></el-table-column>
                    <el-table-column prop="category" label="分类" width="150">
                        <template #default="scope">
                            <el-tag effect="light" size="small">{{ scope.row.category }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="tags" label="标签" width="200">
                        <template #default="scope">
                            <div class="tags-wrapper">
                                <el-tag 
                                    v-for="(tag, index) in scope.row.tags" 
                                    :key="index" 
                                    size="small" 
                                    effect="plain" 
                                    class="tag-item"
                                >
                                    {{ tag }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="创建时间" width="160" sortable></el-table-column>
                    <el-table-column prop="updateTime" label="更新时间" width="160" sortable></el-table-column>
                    <el-table-column label="操作" width="180" fixed="right">
                        <template #default="scope">
                            <el-button type="primary" link size="small" @click="handleEdit('update', scope.row.id)">编辑</el-button>
                            <el-button type="danger" link size="small" @click="handleDelete(scope.row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination-wrapper">
                  <el-pagination
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    :current-page="page"
                    :page-size="limit"
                    :page-sizes="[10, 20, 50]"
                    @size-change="onPageSizeChange"
                    @current-change="onPageChange"
                  />
                </div>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

import { ref, computed, onMounted, watch } from 'vue'
import type { Article } from '@/types/article'
import articleService from '@/services/article.service'
import { useRoute } from 'vue-router'
import { formatDateTime } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import tagService from '@/services/tag.service'

const searchText = ref('')
const articleList = ref<Article[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const handleEdit = (mode: string, id?: string) => {
    navigateTo({ path: '/admin/content/article/edit', query: { mode, id } })
}

const getArticleList = async () => {
  try {
    const res: any = await articleService.getArticles(page.value, limit.value, (searchText.value || '').trim())
    if( res.status === 200 ) {
        const list: Article[] = (res.data || []).map((i: any) => ({
          ...i,
          createTime: formatDateTime(i.createTime),
          updateTime: formatDateTime(i.updateTime),
        }))
        articleList.value = list
        total.value = Number(res.total || 0)
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

onMounted(async () => {
    await getArticleList()
})

const onPageSizeChange = async (val: number) => { limit.value = val; page.value = 1; await getArticleList() }
const onPageChange = async (val: number) => { page.value = val; await getArticleList() }
const onSearch = async () => { page.value = 1; await getArticleList() }

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该文章吗？', '提示', { type: 'warning' })
    // 获取文章标签以便同步更新标签表
    const detail: any = await articleService.getArticle(id)
    const removeTags: string[] = (detail.status === 200) ? (detail.data?.tags || []) : []
    const res: any = await articleService.deleteArticle(id)
    if (res.status === 200) {
      if (removeTags.length) {
        await tagService.syncTags([], removeTags)
      }
      ElMessage.success('删除成功')
      await getArticleList()
    }
  } catch (error: any) {
    ElMessage.error(error?.msg || '删除失败')
  }
}

</script>

<style scoped lang="less">
.article {
  height: 100%;
  display: flex;
  flex-direction: column;
    

    .header {
        margin-bottom: 24px;
        .title {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0;
        }
    }
    
    .article-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        
        :deep(.el-card__body) {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0; 
        }
    }

    .card-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .search-area {
            .search-input {
                width: 300px;
            }
        }
        
        .actions {
            display: flex;
            gap: 16px;
            align-items: center;
        }
    }

    .article-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        :deep(.el-table) {
            flex: 1;
            
            // 表头样式
            th.el-table__cell {
                background-color: var(--bg-color-soft);
                font-weight: 600;
                color: var(--text-color-primary);
            }
        }

        .tags-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            
            .tag-item {
                margin-right: 4px;
            }
        }

        .pagination-wrapper {
            display: flex; 
            justify-content: flex-end; 
            padding: 16px;
            margin-top: auto;
            border-top: 1px solid var(--border-color);
        }
    }
}
</style>
