<template>
  <div class="space-y-6">
    <section class="content-hero">
      <div>
        <p class="content-kicker">Site Content Studio</p>
        <h1 class="content-title">站点内容</h1>
        <p class="content-desc">
          这里统一维护关于页和项目介绍内容。关于页支持中英文 Markdown，项目介绍支持卡片化编辑，方便你后续继续删改。
        </p>
      </div>
      <div class="content-actions">
        <span class="content-updated">最近保存：{{ updatedAtText }}</span>
        <el-button :loading="loading" @click="fetchContent">刷新内容</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存内容</el-button>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <div v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="关于页" name="about">
          <div class="editor-grid">
            <BaseCard>
              <template #header>
                <span>关于页（中文）</span>
              </template>
              <MdEditor v-model="form.about.zh" class="content-editor" />
            </BaseCard>

            <BaseCard>
              <template #header>
                <span>About（English）</span>
              </template>
              <MdEditor v-model="form.about.en" class="content-editor" />
            </BaseCard>
          </div>
        </el-tab-pane>

        <el-tab-pane label="项目介绍" name="projects">
          <div class="project-toolbar">
            <p>项目数据会直接驱动前台 `/project` 页面展示，当前已预置一批示例内容。</p>
            <el-button type="primary" plain @click="addProject">新增项目</el-button>
          </div>

          <div v-if="form.projects.length" class="project-editor-list">
            <BaseCard v-for="(project, index) in form.projects" :key="project.id" class="project-editor-card">
              <template #header>
                <div class="project-card-header">
                  <span>项目 {{ index + 1 }}</span>
                  <div class="project-card-actions">
                    <el-button link :disabled="index === 0" @click="moveProject(index, -1)">上移</el-button>
                    <el-button
                      link
                      :disabled="index === form.projects.length - 1"
                      @click="moveProject(index, 1)"
                    >
                      下移
                    </el-button>
                    <el-button link type="danger" @click="removeProject(index)">删除</el-button>
                  </div>
                </div>
              </template>

              <div class="project-form-grid">
                <el-form label-position="top">
                  <el-form-item label="项目标题">
                    <el-input v-model="project.title" placeholder="例如：PlankBevelen Blog" />
                  </el-form-item>

                  <el-form-item label="一句话简介">
                    <el-input v-model="project.summary" placeholder="一句话告诉访客这个项目是什么" />
                  </el-form-item>

                  <el-form-item label="项目描述">
                    <el-input
                      v-model="project.description"
                      type="textarea"
                      :rows="4"
                      placeholder="补充这个项目的目标、定位和背景"
                    />
                  </el-form-item>

                  <div class="project-inline-grid">
                    <el-form-item label="时间区间">
                      <el-input v-model="project.period" placeholder="例如：2025 - 至今" />
                    </el-form-item>
                    <el-form-item label="项目状态">
                      <el-input v-model="project.status" placeholder="例如：持续迭代" />
                    </el-form-item>
                  </div>

                  <div class="project-inline-grid">
                    <el-form-item label="仓库链接">
                      <el-input v-model="project.links.repoUrl" placeholder="https://github.com/..." />
                    </el-form-item>
                    <el-form-item label="演示链接">
                      <el-input v-model="project.links.demoUrl" placeholder="https://..." />
                    </el-form-item>
                  </div>

                  <div class="project-inline-grid">
                    <el-form-item label="强调色">
                      <el-input v-model="project.accentColor" placeholder="#0f766e" />
                    </el-form-item>
                    <el-form-item label="排序值">
                      <el-input-number v-model="project.sort" :min="1" :max="99" />
                    </el-form-item>
                  </div>

                  <el-form-item label="技术标签">
                    <el-select
                      v-model="project.tags"
                      multiple
                      filterable
                      allow-create
                      default-first-option
                      :reserve-keyword="false"
                      style="width: 100%"
                      placeholder="输入或选择标签"
                    >
                      <el-option
                        v-for="option in allTagOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="亮点列表">
                    <el-input
                      :model-value="project.highlights.join('\n')"
                      type="textarea"
                      :rows="5"
                      placeholder="每行一条亮点"
                      @update:model-value="updateHighlights(project, $event)"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </BaseCard>
          </div>

          <BaseCard v-else>
            <el-empty description="还没有项目介绍内容" />
          </BaseCard>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import siteService from '@/services/site.service'
import type { SiteContent, SiteProject } from '@/types/site'
import { formatDateTime } from '@/utils/format'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const activeTab = ref<'about' | 'projects'>('about')
const loading = ref(false)
const saving = ref(false)
const form = ref<SiteContent>({
  about: {
    zh: '',
    en: ''
  },
  projects: [],
  updatedAt: null
})

const createProject = (index: number): SiteProject => ({
  id: `project-${Date.now()}-${index + 1}`,
  title: '',
  summary: '',
  description: '',
  period: '',
  status: '规划中',
  accentColor: '#0f766e',
  tags: [],
  highlights: [],
  links: {
    repoUrl: '',
    demoUrl: ''
  },
  sort: index + 1
})

const normalizeProject = (project: Partial<SiteProject>, index: number): SiteProject => ({
  id: String(project.id || `project-${Date.now()}-${index + 1}`),
  title: String(project.title || ''),
  summary: String(project.summary || ''),
  description: String(project.description || ''),
  period: String(project.period || ''),
  status: String(project.status || '规划中'),
  accentColor: String(project.accentColor || '#0f766e'),
  tags: Array.isArray(project.tags) ? project.tags.map(item => String(item)).filter(Boolean) : [],
  highlights: Array.isArray(project.highlights)
    ? project.highlights.map(item => String(item).trim()).filter(Boolean)
    : [],
  links: {
    repoUrl: String(project.links?.repoUrl || ''),
    demoUrl: String(project.links?.demoUrl || '')
  },
  sort: Number(project.sort) > 0 ? Number(project.sort) : index + 1
})

const hydrateContent = (content: Partial<SiteContent> | null | undefined) => {
  const projects = Array.isArray(content?.projects)
    ? content.projects.map((project, index) => normalizeProject(project, index))
    : []

  form.value = {
    about: {
      zh: String(content?.about?.zh || ''),
      en: String(content?.about?.en || '')
    },
    projects: projects.sort((a, b) => a.sort - b.sort).map((project, index) => ({ ...project, sort: index + 1 })),
    updatedAt: content?.updatedAt || null
  }
}

const updatedAtText = computed(() =>
  form.value.updatedAt ? formatDateTime(form.value.updatedAt) : '尚未保存'
)

const allTagOptions = computed(() => {
  const tagSet = new Set<string>()
  for (const project of form.value.projects) {
    for (const tag of project.tags || []) {
      if (tag) tagSet.add(tag)
    }
  }
  return Array.from(tagSet).map(tag => ({ label: tag, value: tag }))
})

const summaryCards = computed(() => [
  {
    key: 'about-zh',
    label: '中文关于页',
    value: form.value.about.zh.trim().length,
    desc: '当前 Markdown 字符数'
  },
  {
    key: 'about-en',
    label: '英文 About',
    value: form.value.about.en.trim().length,
    desc: '当前 Markdown 字符数'
  },
  {
    key: 'projects',
    label: '项目数量',
    value: form.value.projects.length,
    desc: '会直接展示在前台项目页'
  },
  {
    key: 'tags',
    label: '项目标签',
    value: allTagOptions.value.length,
    desc: '所有项目去重后的标签数'
  }
])

const syncSort = () => {
  form.value.projects = form.value.projects.map((project, index) => ({
    ...project,
    sort: index + 1
  }))
}

const fetchContent = async () => {
  loading.value = true
  try {
    const res: any = await siteService.getAdminContent()
    if (res?.status === 200 && res.data) {
      hydrateContent(res.data)
      return
    }
    ElMessage.error(res?.msg || '获取站点内容失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '获取站点内容失败')
  } finally {
    loading.value = false
  }
}

const addProject = () => {
  form.value.projects.push(createProject(form.value.projects.length))
  syncSort()
}

const removeProject = (index: number) => {
  form.value.projects.splice(index, 1)
  syncSort()
}

const moveProject = (index: number, step: number) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= form.value.projects.length) return

  const nextProjects = [...form.value.projects]
  const [current] = nextProjects.splice(index, 1)
  nextProjects.splice(targetIndex, 0, current)
  form.value.projects = nextProjects
  syncSort()
}

const updateHighlights = (project: SiteProject, value: string) => {
  project.highlights = String(value || '')
    .split(/\r?\n/g)
    .map(item => item.trim())
    .filter(Boolean)
}

const onSave = async () => {
  if (!form.value.about.zh.trim()) {
    ElMessage.warning('请先填写中文关于页内容')
    activeTab.value = 'about'
    return
  }

  const hasUntitledProject = form.value.projects.some(project => !project.title.trim())
  if (hasUntitledProject) {
    ElMessage.warning('项目标题不能为空')
    activeTab.value = 'projects'
    return
  }

  saving.value = true
  try {
    const payload: SiteContent = {
      about: {
        zh: form.value.about.zh,
        en: form.value.about.en
      },
      projects: form.value.projects.map((project, index) => normalizeProject(project, index))
    }

    const res: any = await siteService.updateAdminContent(payload)
    if (res?.status === 200 && res.data) {
      hydrateContent(res.data)
      ElMessage.success('站点内容保存成功')
      return
    }

    ElMessage.error(res?.msg || '站点内容保存失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '站点内容保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchContent()
})
</script>

<style scoped lang="less">
.content-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 24px;
  border: 1px solid rgba(15, 118, 110, 0.14);
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.16), transparent 28%),
    linear-gradient(140deg, var(--card-color), color-mix(in srgb, var(--card-color) 86%, #eefaf7));
}

.content-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.content-title {
  margin: 0;
  font-size: 30px;
  color: var(--text-color);
}

.content-desc {
  margin: 12px 0 0;
  max-width: 680px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.content-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.content-updated {
  font-size: 13px;
  color: var(--tertiary-color);
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.content-editor {
  height: 640px;
}

.project-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  p {
    margin: 0;
    color: var(--secondary-color);
  }
}

.project-editor-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.project-editor-card {
  overflow: hidden;
}

.project-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.project-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-form-grid {
  display: flex;
  flex-direction: column;
}

.project-inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1100px) {
  .editor-grid,
  .project-inline-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .content-hero,
  .project-toolbar,
  .project-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-actions {
    justify-content: flex-start;
  }

  .content-editor {
    height: 520px;
  }
}
</style>
