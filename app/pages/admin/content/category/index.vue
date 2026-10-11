<template>
  <div class="category-page">
    <AdminPageHeader title="分类" description="维护文章分类，供发布时选用。">
      <template #actions>
        <el-button type="primary" @click="handleEdit('add')">新增分类</el-button>
      </template>
    </AdminPageHeader>

    <BaseDataTable
      :data="filteredCategoryList"
      :loading="loading"
      row-key="id"
      empty-text="暂无分类"
      hide-pagination
    >
      <template #header>
        <BaseQueryBar>
          <el-input
            v-model="searchText"
            placeholder="搜索分类名称"
            clearable
            class="search-input"
          />
        </BaseQueryBar>
      </template>

      <el-table-column prop="name" label="分类名称" min-width="180">
        <template #default="{ row }">
          <span class="name-cell">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="count" label="文章数" width="100" sortable>
        <template #default="{ row }">
          {{ row.count || 0 }}
        </template>
      </el-table-column>

      <el-table-column prop="updatedAt" label="更新时间" width="180" sortable />

      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit('update', row.id)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row.id)">删除</el-button>
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
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import categoryService from '@/services/category'
import type { Category } from '@/types/data/category'
import { formatDateTime } from '@/utils/format'
import { toApiError } from '@/utils/api-error'
import type { FormInstance } from 'element-plus'

const searchText = ref('')
const categoryList = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const mode = ref<'add' | 'update'>('add')
const currentId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const form = ref({ name: '' })
const rules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

const dialogTitle = computed(() => (mode.value === 'add' ? '新增分类' : '编辑分类'))
const filteredCategoryList = computed(() => {
  const text = (searchText.value || '').trim()
  const mapped = categoryList.value.map((c) => ({
    ...c,
    createdAt: formatDateTime(c.createTime || ''),
    updatedAt: formatDateTime(c.updateTime || '')
  }))
  if (!text) return mapped
  return mapped.filter((c) => String(c.name).includes(text))
})

const getCategoryList = async () => {
  loading.value = true
  try {
    categoryList.value = (await categoryService.getCategories()) || []
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '分类查询错误')
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  dialogVisible.value = true
}
const closeDialog = () => {
  dialogVisible.value = false
}

const handleEdit = (m: 'add' | 'update', id?: string) => {
  mode.value = m
  if (m === 'add') {
    currentId.value = null
    form.value = { name: '' }
  } else {
    const item = categoryList.value.find((i) => i.id === id)
    currentId.value = item?.id || null
    form.value = { name: item?.name || '' }
  }
  openDialog()
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该分类吗？', '提示', { type: 'warning' })
    await categoryService.deleteCategory(id)
    ElMessage.success('删除成功')
    await getCategoryList()
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(toApiError(error).message || '删除失败')
  }
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (mode.value === 'add') {
      await categoryService.createCategory(form.value.name)
      ElMessage.success('新增成功')
    } else if (currentId.value) {
      await categoryService.updateCategory(currentId.value, form.value.name)
      ElMessage.success('编辑成功')
    }
    closeDialog()
    await getCategoryList()
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '保存失败')
  }
}

onMounted(() => {
  getCategoryList()
})
</script>

<style lang="less" scoped>
.search-input {
  width: 260px;
}

.name-cell {
  font-weight: 500;
  color: var(--text-color);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-lg;
}
</style>
