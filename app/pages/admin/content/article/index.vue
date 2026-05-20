<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <BaseDataTable
      :data="articleList"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="limit"
      @update:page="onPageChange"
      @update:pageSize="onPageSizeChange"
      @row-click="onRowClick"
    >
      <template #header>
        <BaseQueryBar>
          <div class="flex gap-2 items-center flex-wrap ">
            <el-input
              v-model="query.q"
              placeholder="搜索标题 / 分类 / 标签"
              clearable
              class="!w-[280px]"
              @keyup.enter="onSearch"
            />
            <el-select
              v-model="query.categoryId"
              clearable
              placeholder="分类"
              class="!w-[160px]"
              @change="onSearch"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select v-model="query.sort" class="!w-[140px]" @change="onSearch">
              <el-option label="按创建时间" value="created" />
              <el-option label="按更新时间" value="updated" />
            </el-select>
            <el-button @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </div>
          <template #actions>
            <el-button type="primary" @click="handleEdit('create')">新建文章</el-button>
          </template>
        </BaseQueryBar>
      </template>

      <el-table-column prop="title" label="文章标题" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="text-sm font-medium text-text">{{ row.title }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="category" label="分类" width="150">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.category || '未分类' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="tags" label="标签" min-width="220">
        <template #default="{ row }">
          <div class="flex flex-wrap gap-1">
            <el-tag v-for="tag in row.tags || []" :key="tag" size="small" effect="plain">
              {{ tag }}
            </el-tag>
            <span v-if="!row.tags?.length" class="text-xs text-mute">暂无标签</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" width="170" sortable />
      <el-table-column prop="updateTime" label="更新时间" width="170" sortable />

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click.stop="handleEdit('update', row.id)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click.stop="handleDelete(row.id, row.tags)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </BaseDataTable>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Article } from '@/types/article'
import articleService from '@/services/article.service'
import categoryService from '@/services/category.service'
import tagService from '@/services/tag.service'
import { formatDateTime } from '@/utils/format'

const articleList = ref<Article[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const loading = ref(false)

const query = ref<{
  q: string
  sort: 'created' | 'updated'
  categoryId: number | null
}>({
  q: '',
  sort: 'created',
  categoryId: null
})

const categoryOptions = ref<Array<{ label: string; value: number }>>([])

const selectedCategoryLabel = computed(() => {
  const current = categoryOptions.value.find(item => item.value === query.value.categoryId)
  return current?.label || '全部分类'
})

const summaryCards = computed(() => [
  {
    key: 'total',
    label: '文章总量',
    value: total.value,
    desc: '当前查询结果总数'
  },
  {
    key: 'page',
    label: '当前页数量',
    value: articleList.value.length,
    desc: `第 ${page.value} 页，单页 ${limit.value} 条`
  },
])

const handleEdit = (mode: string, id?: string) => {
  navigateTo({ path: '/admin/content/article/edit', query: { mode, id } })
}

const getArticleList = async () => {
  loading.value = true
  try {
    const res: any = await articleService.getArticles(
      page.value,
      limit.value,
      (query.value.q || '').trim(),
      query.value.sort,
      query.value.categoryId || undefined
    )

    if (res.status === 200) {
      articleList.value = (res.data || []).map((item: any) => ({
        ...item,
        createTime: formatDateTime(item.createTime),
        updateTime: formatDateTime(item.updateTime)
      }))
      total.value = Number(res.total || 0)
      return
    }

    ElMessage.error(res.msg || '获取文章列表失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '获取文章列表失败')
  } finally {
    loading.value = false
  }
}

const getCategoryOptions = async () => {
  const res: any = await categoryService.getCategories()
  if (res?.status === 200) {
    categoryOptions.value = (res.data || []).map((item: any) => ({
      label: item.name,
      value: item.id
    }))
  }
}

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

const onReset = async () => {
  query.value = { q: '', sort: 'created', categoryId: null }
  page.value = 1
  await getArticleList()
}

const onRowClick = (row: Article) => {
  handleEdit('update', row.id)
}

const handleDelete = async (id: string, tags?: string[]) => {
  try {
    await ElMessageBox.confirm('确认删除该文章吗？', '提示', { type: 'warning' })
    const res: any = await articleService.deleteArticle(id)
    if (res.status === 200) {
      const removeTags: string[] = Array.isArray(tags) ? tags : []
      if (removeTags.length) {
        await tagService.syncTags([], removeTags)
      }
      ElMessage.success('删除成功')
      if (articleList.value.length <= 1 && page.value > 1) {
        page.value -= 1
      }
      await getArticleList()
      return
    }

    ElMessage.error(res.msg || '删除失败')
  } catch (error: any) {
    ElMessage.error(error?.msg || '删除失败')
  }
}

onMounted(async () => {
  await getCategoryOptions()
  await getArticleList()
})
</script>

<style scoped lang="less">
.content-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 24px;
}

.article-hero {
  border: 1px solid rgba(0, 105, 217, 0.14);
  background:
    radial-gradient(circle at top right, rgba(0, 105, 217, 0.12), transparent 24%),
    linear-gradient(140deg, var(--card-color), color-mix(in srgb, var(--card-color) 86%, #edf5ff));
}

.hero-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.hero-title {
  margin: 0;
  font-size: 30px;
  color: var(--text-color);
}

.hero-desc {
  margin: 12px 0 0;
  max-width: 640px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.table-tip {
  font-size: 12px;
  color: var(--tertiary-color);
}

@media (max-width: 960px) {
  .content-hero {
    flex-direction: column;
  }
}
</style>
