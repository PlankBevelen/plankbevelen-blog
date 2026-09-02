<template>
  <div class="friend-links">
    <div class="header">
      <h2 class="title">友链管理</h2>
    </div>

    <el-card shadow="hover" class="self-card">
      <template #header>
        <div class="card-header-content">
          <span>本站信息</span>
          <el-button type="primary" link size="small" @click="openSelfEdit">编辑</el-button>
        </div>
      </template>
      <div class="self-info">
        <img class="self-avatar" :src="selfInfo.avatar" alt="" loading="lazy" />
        <div class="self-meta">
          <div class="self-line"><strong>{{ selfInfo.name }}</strong> · <a :href="selfInfo.url" target="_blank" rel="noopener noreferrer">{{ selfInfo.url }}</a></div>
          <div class="self-desc">{{ selfInfo.description }}</div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="friend-links-card">
      <template #header>
        <div class="card-header-content">
          <el-radio-group v-model="statusFilter" @change="getList">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="pending">待审</el-radio-button>
            <el-radio-button value="approved">已通过</el-radio-button>
            <el-radio-button value="rejected">已拒绝</el-radio-button>
          </el-radio-group>
          <div class="actions">
            <el-button type="primary" icon="Plus" @click="handleEdit('add')">新增友链</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="list"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: 'var(--bg-color)', color: 'var(--text-color)' }"
      >
        <el-table-column label="图标" width="70">
          <template #default="scope">
            <div class="avatar-cell">
              <img v-if="scope.row.avatar" :src="scope.row.avatar" alt="" loading="lazy" @error="scope.row.avatar = ''" />
              <span v-else class="avatar-fallback">{{ (scope.row.name || '?').charAt(0).toUpperCase() }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="站点名称" min-width="140" />
        <el-table-column prop="url" label="站点地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)" effect="plain" round>
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="简介" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.status === 'pending'">
              <el-button type="success" link size="small" @click="changeStatus(scope.row, 'approved')">通过</el-button>
              <el-button type="warning" link size="small" @click="changeStatus(scope.row, 'rejected')">拒绝</el-button>
            </template>
            <el-button type="primary" link size="small" @click="handleEdit('update', scope.row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
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
      <el-form :model="selfForm" :rules="selfRules" ref="selfFormRef" label-position="top">
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
import friendLinkService from '@/services/friend-link.service'
import type { FriendLink, FriendLinkSelf } from '@/types/friend-link'

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
    const res: any = await friendLinkService.getSelf()
    if (res.status === 200 && res.data) {
      selfInfo.value = res.data
    }
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
    const res: any = await friendLinkService.adminUpdateSelf({ ...selfForm })
    if (res.status === 200) {
      ElMessage.success('保存成功')
      selfInfo.value = res.data
      selfDialogVisible.value = false
    }
  } catch (error: any) {
    ElMessage.error(error?.data?.msg || '保存失败')
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
    const res: any = await friendLinkService.adminList({ page: 1, limit: 100, status: statusFilter.value || undefined })
    if (res.status === 200) {
      list.value = res.data || []
    }
  } catch (error: any) {
    ElMessage.error(error?.data?.msg || '查询失败')
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
      const res: any = await friendLinkService.adminCreate(payload)
      if (res.status === 200) ElMessage.success('新增成功')
    } else if (currentId.value) {
      const res: any = await friendLinkService.adminUpdate(currentId.value, payload)
      if (res.status === 200) ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    await getList()
  } catch (error: any) {
    ElMessage.error(error?.data?.msg || '保存失败')
  }
}

const changeStatus = async (row: FriendLink, status: string) => {
  try {
    const res: any = await friendLinkService.adminUpdate(row.id, {
      name: row.name,
      url: row.url,
      description: row.description,
      avatar: row.avatar,
      status
    })
    if (res.status === 200) {
      ElMessage.success(status === 'approved' ? '已通过' : '已拒绝')
      await getList()
    }
  } catch (error: any) {
    ElMessage.error(error?.data?.msg || '操作失败')
  }
}

const handleDelete = async (row: FriendLink) => {
  try {
    await ElMessageBox.confirm(`确认删除友链「${row.name}」吗？`, '提示', { type: 'warning' })
    const res: any = await friendLinkService.adminDelete(row.id)
    if (res.status === 200) {
      ElMessage.success('删除成功')
      await getList()
    }
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.data?.msg || '删除失败')
    }
  }
}

onMounted(() => {
  getList()
  getSelf()
})
</script>

<style lang="less" scoped>
.friend-links {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    margin-bottom: @space-4xl;
    .title {
      font-size: @font-size-2xl;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }
  }

  .self-card {
    margin-bottom: @space-3xl;
  }

  .self-info {
    display: flex;
    align-items: center;
    gap: @space-2xl;

    .self-avatar {
      width: 48px;
      height: 48px;
      border-radius: @base-border-radius;
      object-fit: cover;
      flex-shrink: 0;
    }

    .self-meta {
      display: flex;
      flex-direction: column;
      gap: @space-2xs;
      min-width: 0;

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
    }
  }

  .friend-links-card {
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

    .actions {
      display: flex;
      gap: @space-2xl;
      align-items: center;
    }
  }
}

.avatar-cell {
  width: 40px;
  height: 40px;
  border-radius: @base-border-radius;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--mute-bg-color);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    font-size: @font-size-md;
    font-weight: 600;
    color: var(--primary-color);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-lg;
}
</style>
