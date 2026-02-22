<template>
    <div class="category">
        <div class="header">
            <h2 class="title">分类管理</h2>
        </div>

        <el-card shadow="hover" class="category-card">
            <template #header>
                <div class="card-header-content">
                    <div class="search-area">
                        <el-input 
                            v-model="searchText" 
                            placeholder="搜索分类名称" 
                            clearable 
                            prefix-icon="Search"
                            class="search-input"
                        />
                    </div>
                    <div class="actions">
                        <el-button type="primary" icon="Plus" @click="handleEdit('add')">新增分类</el-button>
                    </div>
                </div>
            </template>
            <div class="category-content">
                <el-table :data="filteredCategoryList" style="width: 100%" :header-cell-style="{ background: 'var(--bg-color)', color: 'var(--text-color)' }">
                    <el-table-column prop="name" label="分类名称">
                        <template #default="scope">
                            <span style="font-weight: 500;">{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="count" label="文章数" width="120" sortable>
                        <template #default="scope">
                            <el-tag type="info" effect="plain" round>{{ scope.row.count || 0 }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="created_at" label="创建时间" width="180" sortable></el-table-column>
                    <el-table-column prop="updated_at" label="更新时间" width="180" sortable></el-table-column>
                    <el-table-column label="操作" width="180" fixed="right">
                        <template #default="scope">
                            <el-button type="primary" link size="small" @click="handleEdit('update', scope.row.id)">编辑</el-button>
                            <el-button type="danger" link size="small" @click="handleDelete(scope.row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" destroy-on-close>
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
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
import categoryService from '@/services/category.service'
import { formatDateTime } from '@/utils/format'
import appCache from '@/utils/cache'

const searchText = ref('')
const categoryList = ref<any[]>([])
const dialogVisible = ref(false)
const mode = ref<'add' | 'update'>('add')
const currentId = ref<number | null>(null)
const formRef = ref()
const form = ref({ name: '' })
const rules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

const dialogTitle = computed(() => (mode.value === 'add' ? '新增分类' : '编辑分类'))
const filteredCategoryList = computed(() => {
    const text = (searchText.value || '').trim()
    if (!text) return categoryList.value.map((c) => ({ ...c, created_at: formatDateTime(c.created_at), updated_at: formatDateTime(c.updated_at) }))
    return categoryList.value.filter((c) => String(c.name).includes(text))
})

const getCategoryList = async () => {
    try {
        const res: any = await categoryService.getCategories()
        if (res.status === 200 && res.data.status === 200) {
            categoryList.value = res.data.data
            appCache.setCategories(res.data.data)
        }
    } catch (error: any) {
        ElMessage.error(error.msg || '分类查询错误')
    }
}

const openDialog = () => { dialogVisible.value = true }
const closeDialog = () => { dialogVisible.value = false }

const handleEdit = (m: 'add' | 'update', id?: number) => {
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

const handleDelete = async (id: number) => {
    try {
        await ElMessageBox.confirm('确认删除该分类吗？', '提示', { type: 'warning' })
        const res = await categoryService.deleteCategory(id)
        if (res.status === 200 && res.data.status === 200) {
            ElMessage.success('删除成功')
            await getCategoryList()
        }
    } catch (error: any) {
        ElMessage.error(error.msg || '删除失败')
    }
}

const onSubmit = async () => {
    (formRef.value as any)?.validate(async (valid: boolean) => {
        if (!valid) return
        try {
            if (mode.value === 'add') {
                const res = await categoryService.createCategory(form.value.name)
                if (res.status === 200 && res.data.status === 200) {
                    ElMessage.success('新增成功')
                }
            } else if (currentId.value) {
                const res = await categoryService.updateCategory(currentId.value, form.value.name)
                if (res.status === 200 && res.data.status === 200) {
                    ElMessage.success('编辑成功')
                }
            }
            closeDialog()
            await getCategoryList()
        } catch (error: any) {
            ElMessage.error(error.msg || '保存失败')
        }
    })
}

onMounted(() => { 
    const categories = appCache.getCategories()
    if (categories) {
        categoryList.value = categories.map((c) => ({ ...c, created_at: formatDateTime(c.created_at), updated_at: formatDateTime(c.updated_at) }))
    } else {
        getCategoryList() 
    }
})
</script>

<style lang="less" scoped>
.category {
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
    
    .category-card {
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

    .category-content {
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
    }
}
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }
</style>
