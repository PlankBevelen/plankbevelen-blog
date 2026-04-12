<template>
  <div class="space-y-6">
    <section class="content-hero category-hero">
      <div>
        <p class="hero-kicker">Category Manager</p>
        <h1 class="hero-title">分类管理</h1>
        <p class="hero-desc">
          统一维护文章分类结构，查看分类分布、文章数量以及更新时间，保持内容体系清晰稳定。
        </p>
      </div>
      <el-button type="primary" @click="handleEdit('add')">新增分类</el-button>
    </section>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <BaseDataTable :data="filteredCategoryList" :loading="loading" :show-pagination="false">
      <template #header>
        <BaseQueryBar>
          <div class="flex flex-wrap items-center gap-2">
            <el-input
              v-model="searchText"
              placeholder="搜索分类名称"
              clearable
              class="w-[280px]"
            />
            <el-button @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </div>
          <template #actions>
            <span class="table-tip">分类变更会影响文章的内容归档结构</span>
          </template>
        </BaseQueryBar>
      </template>

      <el-table-column prop="name" label="分类名称" min-width="240">
        <template #default="{ row }">
          <span class="text-sm font-medium text-text">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="count" label="文章数" width="120" sortable>
        <template #default="{ row }">
          <el-tag type="info" effect="plain" round>{{ row.count || 0 }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createdAtText" label="创建时间" width="180" sortable />
      <el-table-column prop="updatedAtText" label="更新时间" width="180" sortable />

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click.stop="handleEdit('update', row.id)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click.stop="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </BaseDataTable>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="onSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import categoryService from '@/services/category.service'
import { formatDateTime } from '@/utils/format'

type CategoryRow = {
  id: number
  name: string
  count?: number
  createdAt?: string | Date
  updatedAt?: string | Date
  createdAtText: string
  updatedAtText: string
}

const searchText = ref('')
const categoryList = ref<CategoryRow[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const mode = ref<'add' | 'update'>('add')
const currentId = ref<number | null>(null)
const formRef = ref()
const form = ref({ name: '' })
const rules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

const dialogTitle = computed(() => (mode.value === 'add' ? '新增分类' : '编辑分类'))
const filteredCategoryList = computed(() => {
  const text = (searchText.value || '').trim()
  if (!text) return categoryList.value
  return categoryList.value.filter(item => String(item.name).includes(text))
})

const summaryCards = computed(() => {
  const totalArticles = categoryList.value.reduce((sum, item) => sum + Number(item.count || 0), 0)
  const hottestCategory = [...categoryList.value].sort((a, b) => Number(b.count || 0) - Number(a.count || 0))[0]

  return [
    {
      key: 'total',
      label: '分类总数',
      value: categoryList.value.length,
      desc: '当前已建立的分类数量'
    },
    {
      key: 'articles',
      label: '归档文章数',
      value: totalArticles,
      desc: '按分类统计的文章总量'
    },
    {
      key: 'search',
      label: '当前筛选结果',
      value: filteredCategoryList.value.length,
      desc: searchText.value ? `关键词：${searchText.value}` : '未输入搜索词'
    },
    {
      key: 'top',
      label: '最大分类',
      value: hottestCategory?.name || '暂无',
      desc: hottestCategory ? `${hottestCategory.count || 0} 篇文章` : '等待分类数据'
    }
  ]
})

const getCategoryList = async () => {
  loading.value = true
  try {
    const res: any = await categoryService.getCategories()
    if (res.status === 200) {
      categoryList.value = (res.data || []).map((item: any) => ({
        ...item,
        createdAtText: formatDateTime(item.createdAt),
        updatedAtText: formatDateTime(item.updatedAt)
      }))
      return
    }

    ElMessage.error(res.msg || '分类查询错误')
  } catch (error: any) {
    ElMessage.error(error?.message || '分类查询错误')
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  dialogVisible.value = true
}

const handleEdit = (m: 'add' | 'update', id?: number) => {
  mode.value = m
  if (m === 'add') {
    currentId.value = null
    form.value = { name: '' }
  } else {
    const item = categoryList.value.find(row => row.id === id)
    currentId.value = item?.id || null
    form.value = { name: item?.name || '' }
  }
  openDialog()
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该分类吗？', '提示', { type: 'warning' })
    const res: any = await categoryService.deleteCategory(id)
    if (res.status === 200) {
      ElMessage.success('删除成功')
      await getCategoryList()
      return
    }
    ElMessage.error(res.msg || '删除失败')
  } catch (error: any) {
    ElMessage.error(error?.msg || '删除失败')
  }
}

const onSearch = () => {}

const onReset = async () => {
  searchText.value = ''
  await getCategoryList()
}

const onSubmit = async () => {
  ;(formRef.value as any)?.validate(async (valid: boolean) => {
    if (!valid) return

    try {
      saving.value = true
      if (mode.value === 'add') {
        const res: any = await categoryService.createCategory(form.value.name)
        if (res.status === 200) {
          ElMessage.success('新增成功')
        } else {
          ElMessage.error(res.msg || '新增失败')
          return
        }
      } else if (currentId.value) {
        const res: any = await categoryService.updateCategory(currentId.value, form.value.name)
        if (res.status === 200) {
          ElMessage.success('编辑成功')
        } else {
          ElMessage.error(res.msg || '编辑失败')
          return
        }
      }

      dialogVisible.value = false
      await getCategoryList()
    } catch (error: any) {
      ElMessage.error(error?.msg || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

onMounted(() => {
  getCategoryList()
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

.category-hero {
  border: 1px solid rgba(25, 135, 84, 0.16);
  background:
    radial-gradient(circle at top right, rgba(25, 135, 84, 0.14), transparent 24%),
    linear-gradient(140deg, var(--card-color), color-mix(in srgb, var(--card-color) 86%, #eefaf3));
}

.hero-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #198754;
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
