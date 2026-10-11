<template>
  <div class="friend-links-page">
    <AdminPageHeader title="友链" description="管理本站展示信息与友链申请审核。">
      <template #actions>
        <el-button type="primary" @click="handleEdit('add')">新增友链</el-button>
      </template>
    </AdminPageHeader>

    <AdminPanel class="self-panel">
      <div class="self-info">
        <div class="avatar-cell">
          <img v-if="selfInfo.avatar" :src="selfInfo.avatar" alt="" loading="lazy" />
          <span v-else class="avatar-fallback">{{ (selfInfo.name || '?').charAt(0).toUpperCase() }}</span>
        </div>
        <div class="self-meta">
          <div class="self-line">
            <strong>{{ selfInfo.name || '未设置本站名称' }}</strong>
            <template v-if="selfInfo.url">
              ·
              <a :href="selfInfo.url" target="_blank" rel="noopener noreferrer">{{ selfInfo.url }}</a>
            </template>
          </div>
          <div class="self-desc">{{ selfInfo.description || '暂无简介' }}</div>
        </div>
        <el-button type="primary" link @click="openSelfEdit">编辑本站信息</el-button>
      </div>
    </AdminPanel>

    <BaseDataTable
      :data="list"
      :loading="loading"
      row-key="id"
      empty-text="暂无友链"
      hide-pagination
    >
      <template #header>
        <BaseQueryBar>
          <el-radio-group v-model="statusFilter" @change="getList">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="pending">待审</el-radio-button>
            <el-radio-button value="approved">已通过</el-radio-button>
            <el-radio-button value="rejected">已拒绝</el-radio-button>
          </el-radio-group>
          <template #actions>
            <el-button @click="getList">刷新</el-button>
          </template>
        </BaseQueryBar>
      </template>

      <el-table-column label="图标" width="70">
        <template #default="{ row }">
          <div class="avatar-cell">
            <img v-if="row.avatar" :src="row.avatar" alt="" loading="lazy" @error="row.avatar = ''" />
            <span v-else class="avatar-fallback">{{ (row.name || '?').charAt(0).toUpperCase() }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="站点名称" min-width="140" />
      <el-table-column prop="url" label="站点地址" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" effect="plain" size="small">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="简介" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button type="success" link size="small" @click="changeStatus(row, 'approved')">通过</el-button>
            <el-button type="warning" link size="small" @click="changeStatus(row, 'rejected')">拒绝</el-button>
          </template>
          <el-button type="primary" link size="small" @click="handleEdit('update', row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </BaseDataTable>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="站点名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="站点地址" prop="url">
          <el-input v-model="form.url" placeholder="https://" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="图标地址" prop="avatar">
          <el-input v-model="form.avatar" placeholder="https://（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="selfDialogVisible" title="编辑本站信息" width="520px" destroy-on-close>
      <el-form ref="selfFormRef" :model="selfForm" :rules="selfRules" label-position="top">
        <el-form-item label="站点名称" prop="name">
          <el-input v-model="selfForm.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="站点地址" prop="url">
          <el-input v-model="selfForm.url" placeholder="https://" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="selfForm.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="图标地址" prop="avatar">
          <el-input v-model="selfForm.avatar" placeholder="https://" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="selfDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSelfSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import friendLinkService from '@/services/friend-link'
import type { FriendLink, FriendLinkSelf, FriendLinkStatus } from '@/types/data/friend-link'
import { toApiError } from '@/utils/api-error'

const list = ref<FriendLink[]>([])
const loading = ref(false)
const statusFilter = ref('')
const dialogVisible = ref(false)
const mode = ref<'add' | 'update'>('add')
const currentId = ref<string | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ name: '', url: '', description: '', avatar: '' })

const rules: FormRules = {
  name: [{ required: true, message: '请输入站点名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入站点地址', trigger: 'blur' }]
}

const selfInfo = ref<FriendLinkSelf>({ name: '', url: '', description: '', avatar: '' })
const selfDialogVisible = ref(false)
const selfFormRef = ref<FormInstance>()
const selfForm = reactive({ name: '', url: '', description: '', avatar: '' })
const selfRules: FormRules = {
  name: [{ required: true, message: '请输入站点名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入站点地址', trigger: 'blur' }]
}

const getSelf = async () => {
  try {
    selfInfo.value = await friendLinkService.getSelf()
  } catch {
    /* 忽略读取失败 */
  }
}

const openSelfEdit = () => {
  selfForm.name = selfInfo.value.name
  selfForm.url = selfInfo.value.url
  selfForm.description = selfInfo.value.description
  selfForm.avatar = selfInfo.value.avatar
  selfDialogVisible.value = true
}

const onSelfSubmit = async () => {
  const valid = await selfFormRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    selfInfo.value = await friendLinkService.adminUpdateSelf({ ...selfForm })
    ElMessage.success('保存成功')
    selfDialogVisible.value = false
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '保存失败')
  }
}

const dialogTitle = computed(() => (mode.value === 'add' ? '新增友链' : '编辑友链'))

const statusText = (s: string) =>
  s === 'pending' ? '待审' : s === 'approved' ? '已通过' : s === 'rejected' ? '已拒绝' : s

const statusTagType = (s: string) =>
  s === 'pending' ? 'warning' : s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'info'

const getList = async () => {
  loading.value = true
  try {
    const res = await friendLinkService.adminList({ page: 1, limit: 100, status: statusFilter.value || undefined })
    list.value = res.data || []
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '查询失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (m: 'add' | 'update', row?: FriendLink) => {
  mode.value = m
  if (m === 'add') {
    currentId.value = null
    form.name = ''
    form.url = ''
    form.description = ''
    form.avatar = ''
  } else if (row) {
    currentId.value = row.id
    form.name = row.name
    form.url = row.url
    form.description = row.description
    form.avatar = row.avatar
  }
  dialogVisible.value = true
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    const payload = { name: form.name, url: form.url, description: form.description, avatar: form.avatar }
    if (mode.value === 'add') {
      await friendLinkService.adminCreate(payload)
      ElMessage.success('新增成功')
    } else if (currentId.value) {
      await friendLinkService.adminUpdate(currentId.value, payload)
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    await getList()
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '保存失败')
  }
}

const changeStatus = async (row: FriendLink, status: FriendLinkStatus) => {
  try {
    await friendLinkService.adminUpdate(row.id, {
      name: row.name,
      url: row.url,
      description: row.description,
      avatar: row.avatar,
      status
    })
    ElMessage.success(status === 'approved' ? '已通过' : '已拒绝')
    await getList()
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '操作失败')
  }
}

const handleDelete = async (row: FriendLink) => {
  try {
    await ElMessageBox.confirm(`确认删除友链「${row.name}」吗？`, '提示', { type: 'warning' })
    await friendLinkService.adminDelete(row.id)
    ElMessage.success('删除成功')
    await getList()
  } catch (error: unknown) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(toApiError(error).message || '删除失败')
    }
  }
}

onMounted(() => {
  getList()
  getSelf()
})
</script>

<style lang="less" scoped>
.self-panel {
  margin-bottom: @space-2xl;
}

.self-info {
  display: flex;
  align-items: center;
  gap: @space-2xl;
}

.self-meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: @space-2xs;
  min-width: 0;
}

.self-line {
  font-size: @font-size-sm;
  color: var(--text-color);

  a {
    color: var(--primary-color);
    text-decoration: none;
  }
}

.self-desc {
  font-size: @font-size-xs;
  color: var(--tertiary-color);
}

.avatar-cell {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: @base-border-radius;
  background-color: var(--mute-bg-color);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-fallback {
  font-size: @font-size-md;
  font-weight: 600;
  color: var(--primary-color);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-lg;
}
</style>
