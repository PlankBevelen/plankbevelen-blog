<template>
    <div class="category container">
        <div class="category-header">
            <div class="search">
                <el-input v-model="searchText" placeholder="请输入分类名称" clearable />
            </div>
            <div class="button-group">
                <el-button type="primary" @click="handleEdit('add')">新增分类</el-button>
            </div>
        </div>
        <div class="category-content">
            <el-table :data="filteredCategoryList" style="width: 100%" stripe>
                <el-table-column prop="name" label="分类名称"></el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
                <el-table-column prop="updated_at" label="更新时间" width="180"></el-table-column>
                <el-table-column label="操作" width="300" class-name="operation-column">
                    <template #default="scope">
                        <el-button type="primary"  @click="handleEdit('update', scope.row.id)">编辑</el-button>
                        <el-button type="danger"  disabled>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
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
import { ElMessage } from 'element-plus'
import categoryService from '@/services/category.service'

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
    if (!text) return categoryList.value
    return categoryList.value.filter((c) => String(c.name).includes(text))
})

const getCategoryList = async () => {
    try {
        const res = await categoryService.getCategories()
        if (res.status === 200 && res.data.status === 200) {
            categoryList.value = res.data.data
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

const onSubmit = async () => {
    ;(formRef.value as any)?.validate(async (valid: boolean) => {
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

onMounted(() => { getCategoryList() })
</script>

<style lang="less" scoped>
.category {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.category-header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
}
.search :deep(.el-input) { width: 280px; }
.category-content :deep(.el-table) { border-radius: 8px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }

</style>
