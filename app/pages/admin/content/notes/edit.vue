<template>
  <div class="note-edit space-y-6">
    <header class="edit-toolbar">
      <h1 class="edit-title">{{ pageTitle }}</h1>
      <div class="edit-actions">
        <el-button @click="navigateTo('/admin/content/notes')">返回列表</el-button>
        <el-button type="primary" :loading="saving" @click="onSubmit">保存笔记</el-button>
      </div>
    </header>

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
              @change="onCategoryChange"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="章节名称（可选）" prop="chapter">
            <el-select
              v-model="form.chapter"
              placeholder="可不选；选择或输入新章节"
              style="width: 100%"
              filterable
              allow-create
              default-first-option
              clearable
              :disabled="!form.category"
              @change="onChapterChange"
            >
              <el-option
                v-for="item in chapterOptions"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
            <p class="field-hint">留空则笔记出现在侧栏一级列表</p>
          </el-form-item>

          <el-form-item v-if="hasChapter" label="章节排序" prop="chapterOrder">
            <el-input-number
              v-model="form.chapterOrder"
              :min="0"
              :step="1"
              controls-position="right"
              style="width: 100%"
            />
            <p class="field-hint">控制侧栏章节组顺序，数值越小越靠前</p>
          </el-form-item>

          <el-form-item label="笔记排序" prop="noteOrder">
            <el-input-number
              v-model="form.noteOrder"
              :min="0"
              :step="1"
              controls-position="right"
              style="width: 100%"
            />
            <p class="field-hint">
              {{ hasChapter ? '控制同章节内笔记顺序' : '控制一级列表中的笔记顺序' }}，数值越小越靠前
            </p>
          </el-form-item>

          <el-form-item prop="content" class="content-validator">
            <input type="hidden" :value="form.content" />
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
          @onChange="onContentChange"
        />
        <p v-if="contentError" class="content-error">{{ contentError }}</p>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { computed, onMounted, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import uploadService from '@/services/upload.service'
import noteService, { type NewNote } from '@/services/note.service'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const route = useRoute()
const formRef = ref<FormInstance>()
const categoryOptions = ref<Array<{ label: string; value: string }>>([])
const chapterOptions = ref<Array<{ name: string; chapterOrder: number }>>([])
const saving = ref(false)
const initializing = ref(false)
const tempId = ref('')
const contentError = ref('')

const mode = computed(() => (route.query.mode === 'update' ? 'update' : 'add'))
const pageTitle = computed(() => (mode.value === 'add' ? '新建笔记' : '编辑笔记'))

const form = ref<NewNote>({
  title: '',
  category: '',
  chapter: '',
  chapterOrder: 0,
  noteOrder: 0,
  content: '',
  tempId: ''
})

const hasChapter = computed(() => !!String(form.value.chapter || '').trim())

const rules: FormRules = {
  title: [{ required: true, message: '请输入笔记标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择笔记分类', trigger: 'change' }],
  noteOrder: [{ required: true, message: '请输入笔记排序', trigger: 'change' }],
  content: [
    {
      validator: (_rule, value, callback) => {
        if (!String(value || '').trim()) {
          callback(new Error('请输入笔记内容'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ]
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

const loadChapters = async (categoryId: string) => {
  if (!categoryId) {
    chapterOptions.value = []
    return
  }
  const res: any = await noteService.getNoteChapters(categoryId)
  if (res?.status === 200) {
    chapterOptions.value = res.data || []
    return
  }
  chapterOptions.value = []
}

const onCategoryChange = async (value: string) => {
  form.value.chapter = ''
  form.value.chapterOrder = 0
  await loadChapters(String(value || ''))
}

const onChapterChange = (value: string) => {
  const chapter = String(value || '').trim()
  form.value.chapter = chapter
  if (!chapter) {
    form.value.chapterOrder = 0
    return
  }
  const matched = chapterOptions.value.find((item) => item.name === chapter)
  if (matched) {
    form.value.chapterOrder = Number(matched.chapterOrder || 0)
  }
}

const onContentChange = () => {
  contentError.value = ''
  formRef.value?.validateField('content').catch(() => {})
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
    noteOrder: Number(res.data.noteOrder || 0),
    content: normalizeContentPath(res.data.content || '')
  }

  if (form.value.category) {
    await loadChapters(form.value.category)
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
  if (!String(form.value.content || '').trim()) {
    contentError.value = '请输入笔记内容'
  }
  if (!valid || contentError.value) return

  if (!hasChapter.value) {
    form.value.chapter = ''
    form.value.chapterOrder = 0
  }

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

watch(
  () => form.value.content,
  () => {
    if (contentError.value && String(form.value.content || '').trim()) {
      contentError.value = ''
    }
  }
)

onMounted(() => {
  initPage()
})
</script>

<style scoped lang="less">
.edit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.edit-title {
  margin: 0;
  font-size: 22px;
  color: var(--text-color);
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.editor-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 24px;
  min-height: calc(100vh - 200px);
}

.meta-panel {
  height: fit-content;
}

.field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--tertiary-color);
}

.content-validator {
  display: none;
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

.content-error {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--el-color-danger);
}

.md-editor {
  height: 72vh !important;
  min-height: 560px;
}

@media (max-width: 1100px) {
  .edit-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .editor-layout {
    grid-template-columns: 1fr;
  }

  .md-editor {
    min-height: 420px;
  }
}
</style>
