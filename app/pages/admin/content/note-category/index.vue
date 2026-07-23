<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <BaseDataTable :data="filteredList" :loading="loading" :show-pagination="false">
      <template #header>
        <BaseQueryBar>
          <div class="flex flex-wrap items-center gap-2">
            <el-input
              v-model="searchText"
              placeholder="搜索分类名称"
              clearable
              class="!w-[280px]"
            />
            <el-button @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </div>
          <template #actions>
            <el-button type="primary" @click="openDialog('add')">新增分类</el-button>
          </template>
        </BaseQueryBar>
      </template>

      <el-table-column prop="name" label="分类名称" min-width="240" />
      <el-table-column prop="count" label="笔记数量" width="120">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.count || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAtText" label="创建时间" width="180" />
      <el-table-column prop="updatedAtText" label="更新时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click.stop="openDialog('edit', row)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click.stop="removeRow(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </BaseDataTable>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '新增分类' : '编辑分类'" width="420px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item v-if="dialogMode === 'edit'" label="分类 ID">
          <el-input v-model="form.id" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { formatDateTime } from '@/utils/format'
import noteService, { type NoteCategory } from '@/services/note.service'

type Row = NoteCategory & {
  createdAtText: string
  updatedAtText: string
}

const loading = ref(false)
const saving = ref(false)
const searchText = ref('')
const list = ref<Row[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<string>('')
const formRef = ref<FormInstance>()
const form = ref({ id: '', name: '' })
const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const filteredList = computed(() => {
  const text = searchText.value.trim()
  if (!text) return list.value
  return list.value.filter(item => String(item.name || '').includes(text))
})

const summaryCards = computed(() => {
  const totalCount = list.value.reduce((sum, item) => sum + Number(item.count || 0), 0)
  const top = [...list.value].sort((a, b) => Number(b.count || 0) - Number(a.count || 0))[0]
  return [
    { key: 'total', label: '分类总数', value: list.value.length, desc: '已创建笔记分类数量' },
    { key: 'notes', label: '笔记归档量', value: totalCount, desc: '全部分类下的笔记数量' },
    { key: 'search', label: '筛选结果', value: filteredList.value.length, desc: searchText.value || '未设置关键词' },
    { key: 'top', label: '最大分类', value: top?.name || '暂无', desc: `${top?.count || 0} 篇笔记` }
  ]
})

const loadList = async () => {
  loading.value = true
  try {
    const res: any = await noteService.getAdminNoteCategories()
    if (res?.status === 200) {
      list.value = (res.data || []).map((item: NoteCategory) => ({
        ...item,
        createdAtText: formatDateTime(item.createTime || ''),
        updatedAtText: formatDateTime(item.updateTime || '')
      }))
      return
    }
    list.value = []
    ElMessage.error(res?.msg || '获取分类失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '获取分类失败')
  } finally {
    loading.value = false
  }
}

const onSearch = () => {}

const onReset = () => {
  searchText.value = ''
}

const openDialog = (mode: 'add' | 'edit', row?: Row) => {
  dialogMode.value = mode
  if (mode === 'add') {
    editingId.value = ''
    form.value.id = ''
    form.value.name = ''
  } else {
    editingId.value = String(row?.id || '')
    form.value.id = String(row?.id || '')
    form.value.name = String(row?.name || '')
  }
  formRef.value?.clearValidate()
  dialogVisible.value = true
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const name = form.value.name.trim()
    let res: any = null
    if (dialogMode.value === 'add') {
      res = await noteService.createAdminNoteCategory(name)
    } else {
      res = await noteService.updateAdminNoteCategory(editingId.value, name)
    }
    if (res?.status !== 200) {
      ElMessage.error(res?.msg || '保存失败')
      return
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    await loadList()
  } catch (error: any) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const removeRow = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该分类吗？', '提示', { type: 'warning' })
    const res: any = await noteService.deleteAdminNoteCategory(id)
    if (res?.status === 200) {
      ElMessage.success('删除成功')
      await loadList()
      return
    }
    ElMessage.error(res?.msg || '删除失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '删除失败')
  }
}

onMounted(() => {
  loadList()
})
</script>
