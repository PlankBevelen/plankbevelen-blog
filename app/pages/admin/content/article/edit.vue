<template>
  <div class="article-edit">
    <div class="header">
      <h2 class="title">{{ pageTitle }}</h2>
      <div class="ops">
        <el-button @click="navigateTo('/admin/content/article')">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存文章</el-button>
      </div>
    </div>

    <div class="editor-layout">
      <el-card shadow="hover" class="panel form-panel">
        <template #header>
            <span>文章设置</span>
        </template>
        <el-form :model="form" ref="formRef" :rules="rules" label-position="top">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入文章标题" clearable />
          </el-form-item>
          <el-form-item label="文章分类" prop="category">
            <el-select v-model="form.category" placeholder="请选择文章分类" style="width: 100%">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
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
              <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
      
      <el-card shadow="hover" class="panel editor-panel">
        <MdEditor 
          v-model="form.content" 
          class="md-editor" 
          placeholder="开始创作你的文章..." 
          :toolbars-exclude="['github']" 
          @onUploadImg="onUploadImg"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth-middleware', layout: false })
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/components/cards/card.vue'
import { ElMessage } from 'element-plus'
import articleService from '@/services/article.service'
import type { NewArticle, Article } from '@/types/article'
import categoryService from '@/services/category.service'
import tagService from '@/services/tag.service'
import uploadService from '@/services/upload.service'

const onUploadImg = async (files: Array<File>, callback: (urls: Array<string>) => void) => {
  try {
    const id = mode.value === 'update' ? (route.query.id as string) : tempId.value
    const res = await uploadService.uploadFiles(files, id) as any
    if (res.status === 200 && res.data) {
      const urls = res.data.map((file: any) => file.url)
      callback(urls)
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch (e) {
    ElMessage.error('图片上传出错')
  }
}

const route = useRoute()
const mode = computed(() => (route.query.mode === 'update' ? 'update' : 'add'))
const pageTitle = computed(() => (mode.value === 'add' ? '新增文章' : '编辑文章'))

const categoryOptions = ref([]) as Ref<{ label: string, value: number }[]>
const tagOptions = ref<{ label: string, value: string }[]>([])

const form = ref<NewArticle>({
  title: '',
  category: '',
  tags: [] as string[],
  content: '',
  tempId: ''
})
const tempId = ref('')
const originalTags = ref<string[]>([])
const rules = ref({
  title: [{ required: true, message: '请输入标题', trigger: ['blur'] }],
  category: [{ required: true, message: '请选择分类', trigger: ['change'] }],
  tags: [{ required: true, message: '请输入标签', trigger: ['blur'] }],
  content: [{ required: true, message: '请输入内容', trigger: ['blur'] }]
})
onMounted(() => {
  // 加载标签
  tagService.getTags().then((res: any) => {
    if (res.status === 200 && res.data.status === 200) {
      tagOptions.value = (res.data.data || []).map((item: any) => ({
        label: item.name,
        value: item.name
      }))
    }
  })

  // 加载分类标签
  categoryService.getCategories().then((res: any) => {
    console.log(res)
    if (res.status === 200) {
      const list = res.data || []
      categoryOptions.value = list.map((item: any) => ({
        label: item.name,
        value: item.id
      }))
    }
  })
  if (mode.value === 'update') {
    const id = route.query.id as string | undefined
    if (id) {
      articleService.getArticle(id).then((res: any) => {
        if (res.status === 200) {
          const d = res.data
          // Fix image paths with backslashes
          let content = d.content || ''
          content = content.replace(/\]\(uploads\\/g, '](/uploads/')
          content = content.replace(/\]\(uploads\//g, '](/uploads/')
          content = content.replace(/src="uploads\\/g, 'src="/uploads/')
          content = content.replace(/src="uploads\//g, 'src="/uploads/')
          
          form.value = {
            title: d.title,
            category: d.category,
            tags: d.tags || [],
            content: content,
          }
          originalTags.value = (d.tags || []).slice()
        }
      })
    }
  } else {
    tempId.value = Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
})

const onSubmit = async () => {
 if(mode.value === 'add') {
  try {
    form.value.tempId = tempId.value
    const res = await articleService.createArticle(form.value)
    if ( res.status === 200 ) {
      if (Array.isArray(form.value.tags) && form.value.tags.length > 0) {
        await tagService.syncTags(form.value.tags, [])
      }
      ElMessage.success('保存成功')
      navigateTo('/admin/content/article', { replace: true })
    }
  } catch (error: any) {
    ElMessage.error(error?.msg || '保存失败')
  }
 } else {
  try {
    const id = route.query.id as string
    const res = await articleService.updateArticle(id, form.value)
    if ( res.status === 200 ) {
      const currentTags = Array.isArray(form.value.tags) ? form.value.tags : []
      const prevTags = originalTags.value
      const add = currentTags.filter(t => !prevTags.includes(t))
      const remove = prevTags.filter(t => !currentTags.includes(t))
      if (add.length || remove.length) {
        await tagService.syncTags(add, remove)
      }
      ElMessage.success('保存成功')
      navigateTo('/admin/content/article', { replace: true })
    }
  } catch (error: any) {
    ElMessage.error(error?.msg || '保存失败')
  }
 }
}
</script>

<style scoped lang="less">
.article-edit {
    height: 100vh;
    display: flex;
    flex-direction: column;

    .header {
        flex: 0 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        height: 60px;
        margin-bottom: 0;

        .title {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0;
        }

        .ops { 
            display: flex; 
            gap: 16px; 
            align-items: center; 
        }
    }

    .editor-layout {
        display: grid;
        grid-template-columns: 320px 1fr;
        grid-gap: 24px;
        padding: 0 24px 24px 24px;
        flex: 1;
        min-height: 0;
        overflow: hidden;

        .panel {
            height: 100%;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            
            :deep(.el-card__body) {
                flex: 1;
                overflow: auto;
                padding: 20px;
            }
        }

        .form-panel {
            :deep(.el-form-item) {
                margin-bottom: 24px;
                
                .el-form-item__label {
                    font-weight: 500;
                    padding-bottom: 8px;
                }
            }
        }
        
        .editor-panel {
            :deep(.el-card__body) {
                padding: 0;
            }
            
            .md-editor {
                height: 100% !important;
                border: none;
            }
        }
    }
}
</style>
