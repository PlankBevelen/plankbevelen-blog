<template>
  <div class="article-edit space-y-6">
    <header class="edit-toolbar">
      <h1 class="edit-title">{{ pageTitle }}</h1>
      <div class="edit-actions">
        <el-button @click="navigateTo('/admin/content/article')">返回列表</el-button>
        <el-button type="primary" :loading="saving" @click="onSubmit">保存文章</el-button>
      </div>
    </header>

    <div v-loading="initializing" class="editor-layout">
      <BaseCard class="meta-panel">
        <template #header>
          <span>文章设置</span>
        </template>

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

        <div class="meta-cards">
          <div class="meta-item">
            <span>字数估算</span>
            <strong>{{ wordCount }}</strong>
          </div>
          <div class="meta-item">
            <span>阅读时间</span>
            <strong>{{ readingTime }} 分钟</strong>
          </div>
          <div class="meta-item">
            <span>标签数量</span>
            <strong>{{ form.tags.length }}</strong>
          </div>
          <div class="meta-item">
            <span>当前模式</span>
            <strong>{{ mode === 'add' ? '新建' : '编辑' }}</strong>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="editor-panel">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>Markdown 编辑器</span>
            <span class="editor-tip">支持图片上传，保存时会自动同步标签统计</span>
          </div>
        </template>

        <MdEditor
          v-model="form.content"
          class="md-editor"
          placeholder="开始创作你的文章内容..."
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
import articleService from '@/services/article.service'
import categoryService from '@/services/category.service'
import tagService from '@/services/tag.service'
import uploadService from '@/services/upload.service'
import type { NewArticle } from '@/types/article'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const route = useRoute()
const formRef = ref<FormInstance>()
const categoryOptions = ref<Array<{ label: string; value: number }>>([])
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
  const [tagRes, categoryRes] = await Promise.all([
    tagService.getTags(),
    categoryService.getCategories()
  ])

  if (tagRes?.status === 200) {
    tagOptions.value = (tagRes.data || []).map((item: any) => ({
      label: item.name,
      value: item.name
    }))
  }

  if (categoryRes?.status === 200) {
    categoryOptions.value = (categoryRes.data || []).map((item: any) => ({
      label: item.name,
      value: item.id
    }))
  }
}

const fetchArticleDetail = async () => {
  if (mode.value !== 'update') {
    tempId.value = Date.now().toString(36) + Math.random().toString(36).slice(2)
    return
  }

  const id = route.query.id as string | undefined
  if (!id) return

  const res: any = await articleService.getArticle(id)
  if (res?.status !== 200 || !res.data) {
    ElMessage.error(res?.msg || '获取文章详情失败')
    return
  }

  form.value = {
    title: res.data.title || '',
    category: res.data.category || '',
    tags: res.data.tags || [],
    content: normalizeContentPath(res.data.content || '')
  }
  originalTags.value = [...(res.data.tags || [])]
}

const initPage = async () => {
  initializing.value = true
  try {
    await Promise.all([fetchBaseOptions(), fetchArticleDetail()])
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

const syncTags = async () => {
  const currentTags = Array.isArray(form.value.tags) ? form.value.tags : []
  const previousTags = originalTags.value
  const add = currentTags.filter(tag => !previousTags.includes(tag))
  const remove = previousTags.filter(tag => !currentTags.includes(tag))

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
      const res: any = await articleService.createArticle(form.value)
      if (res?.status !== 200) {
        ElMessage.error(res?.msg || '保存失败')
        return
      }
      if (form.value.tags.length) {
        await tagService.syncTags(form.value.tags, [])
      }
    } else {
      const id = String(route.query.id || '')
      const res: any = await articleService.updateArticle(id, form.value)
      if (res?.status !== 200) {
        ElMessage.error(res?.msg || '保存失败')
        return
      }
      await syncTags()
    }

    ElMessage.success('保存成功')
    navigateTo('/admin/content/article', { replace: true })
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
.edit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-2xl;
}

.edit-title {
  margin: 0;
  font-size: 22px;
  color: var(--text-color);
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: @space-lg;
}

.editor-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: @space-4xl;
  min-height: calc(100vh - 200px);
}

.meta-panel {
  height: fit-content;
}

.meta-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: @space-lg;
  margin-top: @space-3xl;
}

.meta-item {
  padding: @space-xl;
  border-radius: 18px;
  border: 1px solid var(--border-color);
  background: var(--bg-color, #f7f9fc);

  span {
    display: block;
    font-size: @font-size-xs;
    color: var(--tertiary-color);
  }

  strong {
    display: block;
    margin-top: @space-base;
    font-size: @font-size-lg;
    color: var(--text-color);
  }
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
  font-size: @font-size-xs;
  color: var(--tertiary-color);
}

.md-editor {
  height: 72vh !important;
  min-height: 560px;
}

@media (max-width: @screen-admin-narrow) {
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
