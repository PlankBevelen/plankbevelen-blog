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
      :data="noteRows"
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
          <div class="flex gap-2 items-center flex-wrap">
            <el-input
              v-model="query.q"
              placeholder="搜索标题"
              clearable
              class="!w-[280px]"
              @keyup.enter="onSearch"
            />
            <el-select
              v-model="query.categoryId"
              clearable
              placeholder="分类"
              class="!w-[180px]"
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
            <el-button type="primary" @click="goCreate">新建笔记</el-button>
          </template>
        </BaseQueryBar>
      </template>

      <el-table-column prop="title" label="笔记标题" min-width="240" show-overflow-tooltip />

      <el-table-column prop="category" label="分类" width="180">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.category || '未分类' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="chapter" label="章节" min-width="180" show-overflow-tooltip />
      <el-table-column prop="chapterOrder" label="章节排序" width="110" />
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column prop="updateTime" label="更新时间" width="170" />

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click.stop="goEdit(row.id)">
            编辑
          </el-button>
          <el-button type="primary" link size="small" @click.stop="goView(row.id)">
            预览
          </el-button>
          <el-button type="danger" link size="small" @click.stop="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </BaseDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime } from '@/utils/format'
import noteService, { type NoteCategory, type NoteItem } from '@/services/note.service'

type QueryState = {
  q: string
  sort: 'created' | 'updated'
  categoryId: string
}

const query = ref<QueryState>({
  q: '',
  sort: 'updated',
  categoryId: ''
})

const page = ref(1)
const limit = ref(10)
const total = ref(0)
const loading = ref(false)
const categoryOptions = ref<Array<{ label: string; value: string }>>([])
const noteRows = ref<Array<NoteItem & { createTime: string; updateTime: string }>>([])

const summaryCards = computed(() => [
  {
    key: 'total',
    label: '笔记总量',
    value: total.value,
    desc: '当前筛选条件下的总记录数'
  },
  {
    key: 'page',
    label: '当前页条数',
    value: noteRows.value.length,
    desc: `第 ${page.value} 页，每页 ${limit.value} 条`
  },
  {
    key: 'keyword',
    label: '搜索关键词',
    value: query.value.q || '未设置',
    desc: '按标题匹配'
  },
  {
    key: 'category',
    label: '分类筛选',
    value: categoryOptions.value.find(item => item.value === query.value.categoryId)?.label || '全部分类',
    desc: '可直接按分类管理笔记'
  }
])

const getCategoryOptions = async () => {
  const res: any = await noteService.getAdminNoteCategories()
  if (res?.status === 200) {
    categoryOptions.value = (res.data || []).map((item: NoteCategory) => ({
      label: item.name,
      value: String(item.id)
    }))
  }
}

const getNoteRows = async () => {
  loading.value = true
  try {
    const res: any = await noteService.getAdminNotes(
      page.value,
      limit.value,
      query.value.q.trim(),
      query.value.sort,
      query.value.categoryId || undefined
    )
    if (res?.status === 200) {
      noteRows.value = (res.data || []).map((item: NoteItem) => ({
        ...item,
        createTime: formatDateTime(item.createTime),
        updateTime: formatDateTime(item.updateTime)
      }))
      total.value = Number(res.total || 0)
      return
    }
    noteRows.value = []
    total.value = 0
    ElMessage.error(res?.msg || '获取笔记列表失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '获取笔记列表失败')
  } finally {
    loading.value = false
  }
}

const onSearch = async () => {
  page.value = 1
  await getNoteRows()
}

const onReset = async () => {
  query.value = { q: '', sort: 'updated', categoryId: '' }
  page.value = 1
  await getNoteRows()
}

const onPageChange = async (nextPage: number) => {
  page.value = nextPage
  await getNoteRows()
}

const onPageSizeChange = async (nextSize: number) => {
  limit.value = nextSize
  page.value = 1
  await getNoteRows()
}

const onRowClick = (row: NoteItem) => {
  goEdit(row.id)
}

const goCreate = () => {
  navigateTo('/admin/content/notes/edit?mode=add')
}

const goEdit = (id: string) => {
  navigateTo(`/admin/content/notes/edit?mode=update&id=${id}`)
}

const goView = (id: string) => {
  const row = noteRows.value.find(item => item.id === id)
  if (!row?.categoryId) {
    ElMessage.error('当前笔记缺少分类，无法预览')
    return
  }
  navigateTo({
    path: `/notes/${id}`,
    query: { category: row.categoryId }
  })
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该笔记吗？', '提示', { type: 'warning' })
    const res: any = await noteService.deleteAdminNote(id)
    if (res?.status === 200) {
      ElMessage.success('删除成功')
      if (noteRows.value.length <= 1 && page.value > 1) {
        page.value -= 1
      }
      await getNoteRows()
      return
    }
    ElMessage.error(res?.msg || '删除失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '删除失败')
  }
}

onMounted(async () => {
  await getCategoryOptions()
  await getNoteRows()
})
</script>
