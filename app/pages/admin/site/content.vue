<template>
  <div class="space-y-6">
    <section class="content-hero">
      <div>
        <p class="content-kicker">Site Content Studio</p>
        <h1 class="content-title">站点内容管理</h1>
        <p class="content-desc">
          在这里统一管理关于页、页面导语、时间线卡片和项目内容。保存后，前台页面会直接读取这份数据。
        </p>
      </div>
      <div class="content-actions">
        <span class="content-updated">最后更新：{{ updatedAtText }}</span>
        <el-button :loading="loading" @click="fetchContent">重新加载</el-button>
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
        <el-tab-pane label="页面导语" name="pages">
          <BaseCard>
            <div class="page-intro-toolbar">
              <span class="text-sm text-mute">选择要编辑的页面导语</span>
              <el-select v-model="selectedPageIntro" style="width: 220px">
                <el-option
                  v-for="option in pageIntroOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>

            <div class="editor-grid mt-4">
              <MdEditor v-model="form.pages[selectedPageIntro].zh" class="content-editor content-editor-sm" />
              <MdEditor v-model="form.pages[selectedPageIntro].en" class="content-editor content-editor-sm" />
            </div>
          </BaseCard>
        </el-tab-pane>

        <el-tab-pane label="时间线" name="timeline">
          <div class="section-toolbar">
            <p>时间线卡片会显示在 `/timeline` 页面，也会在 About 页的时间线模块中复用。</p>
            <el-button type="primary" plain @click="addTimelineItem">新增时间线</el-button>
          </div>

          <div v-if="form.timeline.length" class="item-list">
            <BaseCard v-for="(item, index) in form.timeline" :key="item.id" class="item-card">
              <template #header>
                <div class="item-card-header">
                  <span>时间线 {{ index + 1 }}</span>
                  <div class="item-card-actions">
                    <el-button link :disabled="index === 0" @click="moveTimeline(index, -1)">上移</el-button>
                    <el-button
                      link
                      :disabled="index === form.timeline.length - 1"
                      @click="moveTimeline(index, 1)"
                    >
                      下移
                    </el-button>
                    <el-button link type="danger" @click="removeTimeline(index)">删除</el-button>
                  </div>
                </div>
              </template>

              <el-form label-position="top">
                <div class="inline-grid">
                  <el-form-item label="年份">
                    <el-input v-model="item.year" placeholder="2025 / 2025 - Present" />
                  </el-form-item>
                  <el-form-item label="排序">
                    <el-input-number v-model="item.sort" :min="1" :max="999" />
                  </el-form-item>
                </div>

                <div class="inline-grid">
                  <el-form-item label="标题（中文）">
                    <el-input v-model="item.title.zh" placeholder="前端入门" />
                  </el-form-item>
                  <el-form-item label="Title (EN)">
                    <el-input v-model="item.title.en" placeholder="Frontend Foundation" />
                  </el-form-item>
                </div>

                <el-form-item label="描述（中文）">
                  <el-input v-model="item.desc.zh" type="textarea" :rows="3" placeholder="时间线说明" />
                </el-form-item>

                <el-form-item label="Description (EN)">
                  <el-input v-model="item.desc.en" type="textarea" :rows="3" placeholder="Timeline description" />
                </el-form-item>
              </el-form>
            </BaseCard>
          </div>

          <BaseCard v-else>
            <el-empty description="暂无时间线内容" />
          </BaseCard>
        </el-tab-pane>

        <el-tab-pane label="项目" name="projects">
          <div class="section-toolbar">
            <p>项目内容会用于首页精选项目和项目页列表。</p>
            <el-button type="primary" plain @click="addProject">新增项目</el-button>
          </div>

          <div v-if="form.projects.length" class="item-list">
            <BaseCard v-for="(project, index) in form.projects" :key="project.id" class="item-card">
              <template #header>
                <div class="item-card-header">
                  <span>项目 {{ index + 1 }}</span>
                  <div class="item-card-actions">
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

              <el-form label-position="top">
                <el-form-item label="标题">
                  <el-input v-model="project.title" placeholder="PlankBevelen Blog" />
                </el-form-item>

                <el-form-item label="摘要">
                  <el-input v-model="project.summary" placeholder="项目简述" />
                </el-form-item>

                <el-form-item label="描述">
                  <el-input
                    v-model="project.description"
                    type="textarea"
                    :rows="4"
                    placeholder="项目详细说明"
                  />
                </el-form-item>

                <div class="inline-grid">
                  <el-form-item label="周期">
                    <el-input v-model="project.period" placeholder="2025 - Present" />
                  </el-form-item>
                  <el-form-item label="状态">
                    <el-input v-model="project.status" placeholder="In progress" />
                  </el-form-item>
                </div>

                <div class="inline-grid">
                  <el-form-item label="Repo URL">
                    <el-input v-model="project.links.repoUrl" placeholder="https://github.com/..." />
                  </el-form-item>
                  <el-form-item label="Demo URL">
                    <el-input v-model="project.links.demoUrl" placeholder="https://..." />
                  </el-form-item>
                </div>

                <div class="inline-grid">
                  <el-form-item label="主题色">
                    <el-input v-model="project.accentColor" placeholder="#0f766e" />
                  </el-form-item>
                  <el-form-item label="排序">
                    <el-input-number v-model="project.sort" :min="1" :max="999" />
                  </el-form-item>
                </div>

                <el-form-item label="标签">
                  <el-select
                    v-model="project.tags"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    :reserve-keyword="false"
                    style="width: 100%"
                    placeholder="输入后回车添加"
                  >
                    <el-option
                      v-for="option in allTagOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="亮点">
                  <el-input
                    :model-value="project.highlights.join('\n')"
                    type="textarea"
                    :rows="5"
                    placeholder="每行一条亮点"
                    @update:model-value="updateHighlights(project, $event)"
                  />
                </el-form-item>
              </el-form>
            </BaseCard>
          </div>

          <BaseCard v-else>
            <el-empty description="暂无项目内容" />
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
import type { SiteContent, SiteLocalizedText, SiteProject, SiteTimelineItem } from '@/types/site'
import { formatDateTime } from '@/utils/format'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const activeTab = ref<'pages' | 'timeline' | 'projects'>('pages')
const loading = ref(false)
const saving = ref(false)
const selectedPageIntro = ref<'about' | 'timeline' | 'project'>('about')

const pageIntroOptions = [
  { label: '关于导语', value: 'about' },
  { label: '时间线导语', value: 'timeline' },
  { label: '项目导语', value: 'project' }
] as const

const createLocalizedText = (): SiteLocalizedText => ({
  zh: '',
  en: ''
})

const createPages = () => ({
  about: createLocalizedText(),
  timeline: createLocalizedText(),
  project: createLocalizedText()
})

const createTimelineItem = (index: number): SiteTimelineItem => ({
  id: `timeline-${Date.now()}-${index + 1}`,
  year: '',
  title: createLocalizedText(),
  desc: createLocalizedText(),
  sort: index + 1
})

const createProject = (index: number): SiteProject => ({
  id: `project-${Date.now()}-${index + 1}`,
  title: '',
  summary: '',
  description: '',
  period: '',
  status: 'In progress',
  accentColor: '#0f766e',
  tags: [],
  highlights: [],
  links: {
    repoUrl: '',
    demoUrl: ''
  },
  sort: index + 1
})

const normalizeLocalizedText = (value?: Partial<SiteLocalizedText> | null): SiteLocalizedText => ({
  zh: String(value?.zh || ''),
  en: String(value?.en || '')
})

const normalizeProject = (project: Partial<SiteProject>, index: number): SiteProject => ({
  id: String(project.id || `project-${Date.now()}-${index + 1}`),
  title: String(project.title || ''),
  summary: String(project.summary || ''),
  description: String(project.description || ''),
  period: String(project.period || ''),
  status: String(project.status || 'In progress'),
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

const normalizeTimelineItem = (item: Partial<SiteTimelineItem>, index: number): SiteTimelineItem => ({
  id: String(item.id || `timeline-${Date.now()}-${index + 1}`),
  year: String(item.year || ''),
  title: normalizeLocalizedText(item.title),
  desc: normalizeLocalizedText(item.desc),
  sort: Number(item.sort) > 0 ? Number(item.sort) : index + 1
})

const form = ref<SiteContent>({
  about: createLocalizedText(),
  pages: createPages(),
  timeline: [],
  projects: [],
  updatedAt: null
})

const hydrateContent = (content: Partial<SiteContent> | null | undefined) => {
  const timeline = Array.isArray(content?.timeline)
    ? content.timeline.map((item, index) => normalizeTimelineItem(item, index))
    : []
  const projects = Array.isArray(content?.projects)
    ? content.projects.map((project, index) => normalizeProject(project, index))
    : []

  form.value = {
    about: normalizeLocalizedText(content?.about),
    pages: {
      about: normalizeLocalizedText(content?.pages?.about),
      timeline: normalizeLocalizedText(content?.pages?.timeline),
      project: normalizeLocalizedText(content?.pages?.project)
    },
    timeline: timeline
      .sort((a, b) => a.sort - b.sort)
      .map((item, index) => ({ ...item, sort: index + 1 })),
    projects: projects
      .sort((a, b) => a.sort - b.sort)
      .map((project, index) => ({ ...project, sort: index + 1 })),
    updatedAt: content?.updatedAt || null
  }
}

const updatedAtText = computed(() =>
  form.value.updatedAt ? formatDateTime(form.value.updatedAt) : '暂无更新记录'
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
    key: 'timeline',
    label: '时间线卡片',
    value: form.value.timeline.length,
    desc: '前台时间线数量'
  },
  {
    key: 'projects',
    label: '项目数量',
    value: form.value.projects.length,
    desc: '项目列表条目'
  },
  {
    key: 'pages',
    label: '页面导语',
    value: Object.values(form.value.pages).filter(item => item.zh.trim() || item.en.trim()).length,
    desc: '已配置页面文案'
  }
])

const syncTimelineSort = () => {
  form.value.timeline = form.value.timeline.map((item, index) => ({
    ...item,
    sort: index + 1
  }))
}

const syncProjectSort = () => {
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
    ElMessage.error(res?.msg || '加载站点内容失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '加载站点内容失败')
  } finally {
    loading.value = false
  }
}

const addTimelineItem = () => {
  form.value.timeline.push(createTimelineItem(form.value.timeline.length))
  syncTimelineSort()
}

const removeTimeline = (index: number) => {
  form.value.timeline.splice(index, 1)
  syncTimelineSort()
}

const moveTimeline = (index: number, step: number) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= form.value.timeline.length) return

  const next = [...form.value.timeline]
  const [current] = next.splice(index, 1)
  next.splice(targetIndex, 0, current)
  form.value.timeline = next
  syncTimelineSort()
}

const addProject = () => {
  form.value.projects.push(createProject(form.value.projects.length))
  syncProjectSort()
}

const removeProject = (index: number) => {
  form.value.projects.splice(index, 1)
  syncProjectSort()
}

const moveProject = (index: number, step: number) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= form.value.projects.length) return

  const next = [...form.value.projects]
  const [current] = next.splice(index, 1)
  next.splice(targetIndex, 0, current)
  form.value.projects = next
  syncProjectSort()
}

const updateHighlights = (project: SiteProject, value: string) => {
  project.highlights = String(value || '')
    .split(/\r?\n/g)
    .map(item => item.trim())
    .filter(Boolean)
}

const onSave = async () => {

  const hasInvalidTimeline = form.value.timeline.some(item => {
    const title = `${item.title.zh || ''}${item.title.en || ''}`.trim()
    return !item.year.trim() || !title
  })
  if (hasInvalidTimeline) {
    ElMessage.warning('时间线需要填写年份和至少一个标题')
    activeTab.value = 'timeline'
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
      pages: {
        about: {
          zh: form.value.pages.about.zh,
          en: form.value.pages.about.en
        },
        timeline: {
          zh: form.value.pages.timeline.zh,
          en: form.value.pages.timeline.en
        },
        project: {
          zh: form.value.pages.project.zh,
          en: form.value.pages.project.en
        }
      },
      timeline: form.value.timeline.map((item, index) => normalizeTimelineItem(item, index)),
      projects: form.value.projects.map((project, index) => normalizeProject(project, index))
    }

    const res: any = await siteService.updateAdminContent(payload)
    if (res?.status === 200 && res.data) {
      hydrateContent(res.data)
      ElMessage.success('内容已保存')
      return
    }

    ElMessage.error(res?.msg || '保存失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '保存失败')
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

.page-intro-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.page-editor-list,
.item-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.item-card {
  overflow: hidden;
}

.item-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.item-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-toolbar {
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

.inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.content-editor {
  height: 640px;
}

.content-editor-sm {
  height: 420px;
}

@media (max-width: 1100px) {
  .editor-grid,
  .inline-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .content-hero,
  .section-toolbar,
  .item-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-actions {
    justify-content: flex-start;
  }
}
</style>
