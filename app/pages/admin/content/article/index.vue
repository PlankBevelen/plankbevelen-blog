<template>
  <div class="article-page">
    <AdminPageHeader title="文章" description="管理博客文章的发布与更新。">
      <template #actions>
        <el-button type="primary" @click="handleEdit('add')">新增文章</el-button>
      </template>
    </AdminPageHeader>

    <BaseDataTable
      :data="articleList"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="limit"
      row-key="id"
      empty-text="暂无文章"
      @update:page="onPageChange"
      @update:pageSize="onPageSizeChange"
    >
      <template #header>
        <BaseQueryBar>
          <el-input
            v-model="searchText"
            placeholder="搜索标题、分类、标签"
            clearable
            class="search-input"
            @keyup.enter="onSearch"
            @clear="onSearch"
          />
          <el-button @click="onSearch">查询</el-button>
        </BaseQueryBar>
      </template>

      <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="title-cell">{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.category" effect="plain" size="small">{{ row.category }}</el-tag>
          <span v-else class="mute">—</span>
        </template>
      </el-table-column>

      <el-table-column label="标签" min-width="160">
        <template #default="{ row }">
          <div v-if="row.tags?.length" class="tags-wrapper">
            <el-tag
              v-for="tag in visibleTags(row.tags)"
              :key="tag"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
            <span v-if="row.tags.length > 2" class="mute">+{{ row.tags.length - 2 }}</span>
          </div>
          <span v-else class="mute">—</span>
        </template>
      </el-table-column>

      <el-table-column prop="updateTime" label="更新时间" width="170" />

      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit('update', row.id)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </BaseDataTable>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

import { ref, onMounted } from 'vue'
import type { Article } from '@/types/data/article'
import articleService from '@/services/article'
import { formatDateTime } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import tagService from '@/services/tag'
import { toApiError } from '@/utils/api-error'

const searchText = ref('')
const articleList = ref<Article[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const loading = ref(false)

const visibleTags = (tags: string[]) => tags.slice(0, 2)

const handleEdit = (mode: string, id?: string) => {
  navigateTo({ path: '/admin/content/article/edit', query: { mode, id } })
}

const getArticleList = async () => {
  loading.value = true
  try {
    const res = await articleService.getArticles(page.value, limit.value, (searchText.value || '').trim())
    articleList.value = (res.data || []).map((i) => ({
      ...i,
      createTime: formatDateTime(i.createTime),
      updateTime: formatDateTime(i.updateTime)
    }))
    total.value = Number(res.total || 0)
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '获取文章列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await getArticleList()
})

const onPageSizeChange = async (val: number) => {
  limit.value = val
  page.value = 1
  await getArticleList()
}
const onPageChange = async (val: number) => {
  page.value = val
  await getArticleList()
}
const onSearch = async () => {
  page.value = 1
  await getArticleList()
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该文章吗？', '提示', { type: 'warning' })
    const detail = await articleService.getArticle(id)
    const removeTags: string[] = detail?.tags || []
    await articleService.deleteArticle(id)
    if (removeTags.length) {
      await tagService.syncTags([], removeTags)
    }
    ElMessage.success('删除成功')
    await getArticleList()
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(toApiError(error).message || '删除失败')
  }
}
</script>

<style scoped lang="less">
.search-input {
  width: 280px;
}

.title-cell {
  font-weight: 500;
  color: var(--text-color);
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-2xs;
}

.mute {
  color: var(--mute-color);
  font-size: @font-size-xs;
}
</style>
