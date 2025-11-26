<template>
    <div class="article-edit container">
        <div class="header">
            <div class="left">
              <el-button @click="navigateTo('/admin/content/article')">返回</el-button>
            </div>
            <div class="center"><h2 class="title">{{ pageTitle }}</h2></div>
            <div class="ops">
              <el-button type="primary" @click="onSubmit">保存</el-button>
            </div>
        </div>
        <div class="editor-layout">
          <Card class="panel form-panel">
            <el-form :model="form" ref="formRef" :rules="rules" label-position="top">
              <el-form-item label="标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入标题" />
              </el-form-item>
              <el-form-item label="分类" prop="category">
                <el-select v-model="form.category" placeholder="请选择分类">
                  <el-option label="分类1" value="1" />
                  <el-option label="分类2" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="标签" prop="tags">
                <el-input v-model="form.tags" placeholder="标签以逗号分隔" />
              </el-form-item>
            </el-form>
          </Card>
          <Card class="panel editor-panel">
            <MdEditor v-model="form.content" class="md-editor"/>
          </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/components/cards/card.vue'

const route = useRoute()
const mode = computed(() => (route.query.mode === 'update' ? 'update' : 'add'))
const pageTitle = computed(() => (mode.value === 'add' ? '新增文章' : '编辑文章'))

// 实际文章内容要把 title => 转换为 # title
const articleContent = computed(() => {
  return `# ${form.value.title}\n${form.value.content}`
})
const form = ref({
  title: '',
  category: '',
  tags: '',
  content: ''
})
const rules = ref({
  title: [{ required: true, message: '请输入标题', trigger: ['blur'] }],
  category: [{ required: true, message: '请选择分类', trigger: ['change'] }],
  tags: [{ required: true, message: '请输入标签', trigger: ['blur'] }],
  content: [{ required: true, message: '请输入内容', trigger: ['blur'] }]
})
onMounted(() => {
  if (mode.value === 'update') {
    const id = route.query.id as string | undefined
    if (id) {

    }
  }
})

const onSubmit = () => {
  
}
</script>

<style scoped lang="less">
.article-edit {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 40px;
    .header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      background: var(--card-color);
      border-bottom: 1px solid var(--border-color);
      .left { display: flex; gap: @base-gap; }
      .center { display: flex; justify-content: center; }
      .title { font-size: 18px; }
      .ops { display: flex; gap: @base-gap; justify-content: flex-end; }
      :deep(.el-button) {
        padding: 8px 16px;
      }
    }
    .editor-layout {
        display: grid;
        grid-template-columns: 1fr 2fr;
        grid-gap: 20px;
        flex: 1;
    }
    .panel {
        height: 100%;
    }
    .form-panel :deep(.el-form-item) {
        margin-bottom: 16px;
    }
    .editor-panel .md-wrapper {
        height: 650px;
    }
    .editor-panel :deep(.md-editor) {
        height: 100% !important;
    }
}
</style>
