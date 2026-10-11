<template>
  <div class="article-edit">
    <header class="edit-toolbar">
      <div class="edit-toolbar__left">
        <el-button @click="navigateTo('/admin/content/article')">返回</el-button>
        <h1 class="edit-title">{{ pageTitle }}</h1>
      </div>
      <el-button type="primary" :loading="saving" @click="onSubmit">保存文章</el-button>
    </header>

    <div v-loading="initializing" class="editor-layout">
      <AdminPanel title="文章设置" class="meta-panel">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入文章标题" clearable />
          </el-form-item>

          <el-form-item label="文章分类" prop="category">
            <el-select
              v-model="form.category"
              placeholder="请选择文章分类"
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

          <el-form-item label="文章标签" prop="tags">
            <el-select
              v-model="form.tags"
              multiple
              filterable
              allow-create
              default-first-option
              :reserve-keyword="false"
              placeholder="输入或选择标签"
              style="width: 100%"
            >
              <el-option
                v-for="item in tagOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="meta-strip">
          <div class="meta-item">
            <span>字数</span>
            <strong>{{ wordCount }}</strong>
          </div>
          <div class="meta-item">
            <span>阅读</span>
            <strong>{{ readingTime }} 分</strong>
          </div>
          <div class="meta-item">
            <span>标签</span>
            <strong>{{ form.tags.length }}</strong>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel class="editor-panel">
        <template #header>
          <span>正文</span>
        </template>
        <template #extra>
          <span class="editor-tip">支持图片上传</span>
        </template>
        <MdEditor
          v-model="form.content"
          class="md-editor"
          placeholder="开始创作你的文章内容..."
          :toolbars-exclude="['github']"
          @onUploadImg="onUploadImg"
        />
      </AdminPanel>
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
import articleService from '@/services/article'
import categoryService from '@/services/category'
import tagService from '@/services/tag'
import uploadService from '@/services/upload'
import type { NewArticle } from '@/types/request/article'
import { toApiError } from '@/utils/api-error'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const route = useRoute()
const formRef = ref<FormInstance>()
const categoryOptions = ref<Array<{ label: string; value: string }>>([])
const tagOptions = ref<Array<{ label: string; value: string }>>([])
const saving = ref(false)
const initializing = ref(false)
const tempId = ref('')
const originalTags = ref<string[]>([])

const mode = computed(() => (route.query.mode === 'update' ? 'update' : 'add'))
const pageTitle = computed(() => (mode.value === 'add' ? '新建文章' : '编辑文章'))

const form = ref<NewArticle>({
  title: '',
  category: '',
  tags: [],
  content: '',
  tempId: ''
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  tags: [{ required: true, message: '请至少填写一个标签', trigger: 'change' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
}

const wordCount = computed(() =>
  String(form.value.content || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
)

const readingTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 260)))

const normalizeContentPath = (content: string) =>
  content
    .replace(/\]\(uploads\\/g, '](/uploads/')
    .replace(/\]\(uploads\//g, '](/uploads/')
    .replace(/src="uploads\\/g, 'src="/uploads/')
    .replace(/src="uploads\//g, 'src="/uploads/')

const fetchBaseOptions = async () => {
  const [tags, categories] = await Promise.all([
    tagService.getTags(),
    categoryService.getCategories()
  ])

  tagOptions.value = (tags || []).map((item) => ({
    label: item.name,
    value: item.name
  }))

  categoryOptions.value = (categories || []).map((item) => ({
    label: item.name,
    value: item.id
  }))
}

const fetchArticleDetail = async () => {
  if (mode.value !== 'update') {
    tempId.value = Date.now().toString(36) + Math.random().toString(36).slice(2)
    return
  }

  const id = route.query.id as string | undefined
  if (!id) return

  try {
    const data = await articleService.getArticle(id)
    form.value = {
      title: data.title || '',
      category: data.category || '',
      tags: data.tags || [],
      content: normalizeContentPath(data.content || '')
    }
    originalTags.value = [...(data.tags || [])]
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '获取文章详情失败')
  }
}

const initPage = async () => {
  initializing.value = true
  try {
    await Promise.all([fetchBaseOptions(), fetchArticleDetail()])
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '初始化编辑页失败')
  } finally {
    initializing.value = false
  }
}

const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  try {
    const id = mode.value === 'update' ? String(route.query.id || '') : tempId.value
    const uploaded = await uploadService.uploadFiles(files, id)
    if (Array.isArray(uploaded)) {
      callback(uploaded.map((file) => file.url))
      return
    }
    ElMessage.error('图片上传失败')
  } catch {
    ElMessage.error('图片上传失败')
  }
}

const syncTags = async () => {
  const currentTags = Array.isArray(form.value.tags) ? form.value.tags : []
  const previousTags = originalTags.value
  const add = currentTags.filter((tag) => !previousTags.includes(tag))
  const remove = previousTags.filter((tag) => !currentTags.includes(tag))

  if (add.length || remove.length) {
    await tagService.syncTags(add, remove)
  }
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (mode.value === 'add') {
      form.value.tempId = tempId.value
      await articleService.createArticle(form.value)
      if (form.value.tags.length) {
        await tagService.syncTags(form.value.tags, [])
      }
    } else {
      const id = String(route.query.id || '')
      await articleService.updateArticle(id, form.value)
      await syncTags()
    }

    ElMessage.success('保存成功')
    navigateTo('/admin/content/article', { replace: true })
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  initPage()
})
</script>

<style scoped lang="less">
.edit-toolbar {
  position: sticky;
  top: 0;
  z-index: @z-dropdown;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-2xl;
  margin: -@space-2xl -@space-3xl @space-2xl;
  padding: @space-lg @space-3xl;
  border-bottom: 1px solid var(--border-color);
  background: var(--header-color, var(--card-color));
}

.edit-toolbar__left {
  display: flex;
  align-items: center;
  gap: @space-lg;
  min-width: 0;
}

.edit-title {
  margin: 0;
  font-size: @font-size-lg;
  font-weight: 600;
  color: var(--text-color);
}

.editor-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: @space-2xl;
  min-height: calc(100vh - 180px);
}

.meta-panel {
  height: fit-content;
}

.meta-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-top: @space-lg;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: @small-border-radius;
  background: var(--border-color);
}

.meta-item {
  padding: @space-lg;
  background: var(--bg-color);

  span {
    display: block;
    font-size: @font-size-xs;
    color: var(--mute-color);
  }

  strong {
    display: block;
    margin-top: @space-2xs;
    font-size: @font-size-md;
    color: var(--text-color);
  }
}

.editor-panel {
  min-width: 0;

  :deep(.admin-panel__body) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
  }
}

.editor-tip {
  font-size: @font-size-xs;
  color: var(--tertiary-color);
  font-weight: 400;
}

.md-editor {
  height: calc(100vh - 200px) !important;
  min-height: 520px;
  border: none !important;
}

@media (max-width: @screen-admin-narrow) {
  .edit-toolbar {
    flex-wrap: wrap;
  }

  .editor-layout {
    grid-template-columns: 1fr;
  }

  .md-editor {
    min-height: 420px;
    height: 60vh !important;
  }
}
</style>
