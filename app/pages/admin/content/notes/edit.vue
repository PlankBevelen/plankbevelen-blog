<template>
  <div class="note-edit space-y-6">
    <section class="edit-hero">
      <div>
        <p class="edit-kicker">Notes Studio</p>
        <h1 class="edit-title">{{ pageTitle }}</h1>
        <p class="edit-desc">
          结构是 分类 -> 章节 -> 笔记标题，例如：工程化 -> nginx -> nginx 下载。
        </p>
      </div>
      <div class="edit-actions">
        <el-button @click="navigateTo('/admin/content/notes')">返回列表</el-button>
        <el-button type="primary" :loading="saving" @click="onSubmit">保存笔记</el-button>
      </div>
    </section>

    <div v-loading="initializing" class="editor-layout">
      <BaseCard class="meta-panel">
        <template #header>
          <span>笔记设置</span>
        </template>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="笔记标题" prop="title">
            <el-input v-model="form.title" placeholder="例如：nginx 下载" clearable />
          </el-form-item>

          <el-form-item label="笔记分类" prop="category">
            <el-select
              v-model="form.category"
              placeholder="请选择笔记分类"
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="章节名称" prop="chapter">
            <el-input v-model="form.chapter" placeholder="例如：nginx" clearable />
          </el-form-item>

          <el-form-item label="章节排序" prop="chapterOrder">
            <el-input-number
              v-model="form.chapterOrder"
              :min="0"
              :step="1"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>

        </el-form>
      </BaseCard>

      <BaseCard class="editor-panel">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>Markdown 编辑器</span>
            <span class="editor-tip">支持图片上传，保存时自动写入 notes 集合</span>
          </div>
        </template>

        <MdEditor
          v-model="form.content"
          class="md-editor"
          placeholder="开始撰写你的笔记内容..."
          :toolbars-exclude="['github']"
          @onUploadImg="onUploadImg"
        />
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { computed, onMounted, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import uploadService from '@/services/upload.service'
import noteService, { type NewNote } from '@/services/note.service'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const route = useRoute()
const formRef = ref<FormInstance>()
const categoryOptions = ref<Array<{ label: string; value: string }>>([])
const saving = ref(false)
const initializing = ref(false)
const tempId = ref('')

const mode = computed(() => (route.query.mode === 'update' ? 'update' : 'add'))
const pageTitle = computed(() => (mode.value === 'add' ? '新建笔记' : '编辑笔记'))

const form = ref<NewNote>({
  title: '',
  category: '',
  chapter: '',
  chapterOrder: 0,
  content: '',
  tempId: ''
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入笔记标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择笔记分类', trigger: 'change' }],
  chapter: [{ required: true, message: '请输入章节名称', trigger: 'blur' }],
  chapterOrder: [{ required: true, message: '请输入章节排序', trigger: 'change' }],
  content: [{ required: true, message: '请输入笔记内容', trigger: 'blur' }]
}

const normalizeContentPath = (content: string) =>
  content
    .replace(/\]\(uploads\\/g, '](/uploads/')
    .replace(/\]\(uploads\//g, '](/uploads/')
    .replace(/src="uploads\\/g, 'src="/uploads/')
    .replace(/src="uploads\//g, 'src="/uploads/')

const fetchBaseOptions = async () => {
  const categoryRes: any = await noteService.getAdminNoteCategories()

  if (categoryRes?.status === 200) {
    categoryOptions.value = (categoryRes.data || []).map((item: any) => ({
      label: item.name,
      value: String(item.id)
    }))
  }
}

const fetchNoteDetail = async () => {
  if (mode.value !== 'update') {
    tempId.value = Date.now().toString(36) + Math.random().toString(36).slice(2)
    return
  }

  const id = String(route.query.id || '')
  if (!id) return

  const res: any = await noteService.getAdminNoteDetail(id)
  if (res?.status !== 200 || !res.data) {
    ElMessage.error(res?.msg || '获取笔记详情失败')
    await navigateTo('/admin/content/notes', { replace: true })
    return
  }

  form.value = {
    title: res.data.title || '',
    category: String(res.data.category || ''),
    chapter: String(res.data.chapter || ''),
    chapterOrder: Number(res.data.chapterOrder || 0),
    content: normalizeContentPath(res.data.content || '')
  }
}

const initPage = async () => {
  initializing.value = true
  try {
    await Promise.all([fetchBaseOptions(), fetchNoteDetail()])
  } catch (error: any) {
    ElMessage.error(error?.message || '初始化编辑页失败')
  } finally {
    initializing.value = false
  }
}

const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  try {
    const id = mode.value === 'update' ? String(route.query.id || '') : tempId.value
    const res: any = await uploadService.uploadFiles(files, id)
    if (res?.status === 200 && Array.isArray(res.data)) {
      callback(res.data.map((file: any) => file.url))
      return
    }
    ElMessage.error('图片上传失败')
  } catch {
    ElMessage.error('图片上传失败')
  }
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (mode.value === 'add') {
      form.value.tempId = tempId.value
      const res: any = await noteService.createAdminNote(form.value)
      if (res?.status !== 200) {
        ElMessage.error(res?.msg || '保存失败')
        return
      }
    } else {
      const id = String(route.query.id || '')
      const res: any = await noteService.updateAdminNote(id, form.value)
      if (res?.status !== 200) {
        ElMessage.error(res?.msg || '保存失败')
        return
      }
    }

    ElMessage.success('保存成功')
    navigateTo('/admin/content/notes', { replace: true })
  } catch (error: any) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  initPage()
})
</script>

<style scoped lang="less">
.edit-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 24px;
  border: 1px solid rgba(0, 105, 217, 0.14);
  background:
    radial-gradient(circle at top right, rgba(230, 162, 60, 0.12), transparent 24%),
    linear-gradient(140deg, var(--card-color), color-mix(in srgb, var(--card-color) 88%, #fff7ea));
}

.edit-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #e6a23c;
}

.edit-title {
  margin: 0;
  font-size: 30px;
  color: var(--text-color);
}

.edit-desc {
  margin: 12px 0 0;
  max-width: 680px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.editor-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 24px;
  min-height: calc(100vh - 260px);
}

.meta-panel {
  height: fit-content;
}

.editor-panel {
  min-width: 0;

  :deep(.card-content) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

.editor-tip {
  font-size: 12px;
  color: var(--tertiary-color);
}

.md-editor {
  height: 72vh !important;
  min-height: 560px;
}

@media (max-width: 1100px) {
  .edit-hero {
    flex-direction: column;
  }

  .editor-layout {
    grid-template-columns: 1fr;
  }

  .md-editor {
    min-height: 420px;
  }
}
</style>
