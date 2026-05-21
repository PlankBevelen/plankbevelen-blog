<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
      <BaseCard>
        <p class="text-xs text-mute">最后更新</p>
        <div class="!mt-1 text-sm font-semibold text-text">{{ updatedAtText }}</div>
        <div class="!mt-1 flex gap-3">
          <el-button :loading="loading" @click="fetchContent">重新加载</el-button>
          <el-button type="primary" :loading="saving" @click="onSave">保存内容</el-button>
        </div>
      </BaseCard>
    </div>

    <LayoutTwoColumn v-loading="loading" type="rightbigger">
      <template #left>
        <BaseCard>
          <div class="flex flex-col gap-1 text-sm">
            <button
              v-for="section in sections"
              :key="section.key"
              class="section-nav-item"
              :class="{ active: activeSection === section.key }"
              @click="switchSection(section.key)"
            >
              <span>{{ section.label }}</span>
              <span class="nav-count">{{ section.count }}</span>
            </button>
          </div>
        </BaseCard>

        <BaseCard v-if="activeSection === 'timeline'">
          <template #header>
            <div class="card-list-header">
              <span>时间线列表</span>
              <el-button link type="primary" @click="addTimelineItem">+ 新增</el-button>
            </div>
          </template>
          <div v-if="form.timeline.length" class="card-list-items">
            <button
              v-for="(item, index) in form.timeline"
              :key="item.id"
              class="card-list-item"
              :class="{ active: selectedTimelineIndex === index }"
              @click="selectedTimelineIndex = index"
            >
              <span class="item-label">{{ item.year || '未设置' }}</span>
              <span class="item-sublabel">{{ item.title.zh || item.title.en || '未命名' }}</span>
            </button>
          </div>
          <el-empty v-else description="暂无时间线" :image-size="60" />
        </BaseCard>

        <BaseCard v-if="activeSection === 'projects'">
          <template #header>
            <div class="card-list-header">
              <span>项目列表</span>
              <el-button link type="primary" @click="addProject">+ 新增</el-button>
            </div>
          </template>
          <div v-if="form.projects.length" class="card-list-items">
            <button
              v-for="(project, index) in form.projects"
              :key="project.id"
              class="card-list-item"
              :class="{ active: selectedProjectIndex === index }"
              @click="selectedProjectIndex = index"
            >
              <span class="item-label">{{ project.title || '未命名' }}</span>
              <span class="item-sublabel">{{ project.summary || '' }}</span>
            </button>
          </div>
          <el-empty v-else description="暂无项目" :image-size="60" />
        </BaseCard>
      </template>

      <template #right>
        <div v-if="activeSection === 'about'">
          <div class="section-head">
            <h2 class="section-title">关于页面</h2>
            <p class="section-desc">编辑 /about 页面的介绍内容，支持 Markdown。</p>
          </div>
          <BaseCard>
            <div class="editor-grid">
              <div>
                <p class="editor-label">中文</p>
                <MdEditor v-model="form.pages.about.zh" class="content-editor" />
              </div>
              <div>
                <p class="editor-label">English</p>
                <MdEditor v-model="form.pages.about.en" class="content-editor" />
              </div>
            </div>
          </BaseCard>
        </div>

        <div v-if="activeSection === 'timeline'">
          <template v-if="editingTimelineItem">
            <div class="section-head">
              <div>
                <h2 class="section-title">编辑时间线</h2>
                <p class="section-desc">修改年份、标题和描述内容。</p>
              </div>
              <div class="section-head-actions">
                <el-button
                  :disabled="selectedTimelineIndex === 0"
                  @click="moveTimeline(selectedTimelineIndex, -1)"
                >上移</el-button>
                <el-button
                  :disabled="selectedTimelineIndex === form.timeline.length - 1"
                  @click="moveTimeline(selectedTimelineIndex, 1)"
                >下移</el-button>
                <el-button type="danger" plain @click="removeTimeline(selectedTimelineIndex)">删除</el-button>
              </div>
            </div>
            <BaseCard>
              <el-form label-position="top">
                <div class="inline-grid">
                  <el-form-item label="年份">
                    <el-input v-model="editingTimelineItem.year" placeholder="2025 / 2025 - Present" />
                  </el-form-item>
                  <el-form-item label="排序">
                    <el-input-number v-model="editingTimelineItem.sort" :min="1" :max="999" />
                  </el-form-item>
                </div>
                <div class="inline-grid">
                  <el-form-item label="标题（中文）">
                    <el-input v-model="editingTimelineItem.title.zh" placeholder="前端入门" />
                  </el-form-item>
                  <el-form-item label="Title (EN)">
                    <el-input v-model="editingTimelineItem.title.en" placeholder="Frontend Foundation" />
                  </el-form-item>
                </div>
                <el-form-item label="描述（中文）">
                  <el-input v-model="editingTimelineItem.desc.zh" type="textarea" :rows="3" placeholder="时间线说明" />
                </el-form-item>
                <el-form-item label="Description (EN)">
                  <el-input v-model="editingTimelineItem.desc.en" type="textarea" :rows="3" placeholder="Timeline description" />
                </el-form-item>
              </el-form>
            </BaseCard>
          </template>
          <BaseCard v-else>
            <el-empty description="请从左侧选择一条时间线" />
          </BaseCard>
        </div>

        <div v-if="activeSection === 'projects'">
          <template v-if="editingProject">
            <div class="section-head">
              <div>
                <h2 class="section-title">编辑项目</h2>
                <p class="section-desc">修改项目信息与链接。</p>
              </div>
              <div class="section-head-actions">
                <el-button
                  :disabled="selectedProjectIndex === 0"
                  @click="moveProject(selectedProjectIndex, -1)"
                >上移</el-button>
                <el-button
                  :disabled="selectedProjectIndex === form.projects.length - 1"
                  @click="moveProject(selectedProjectIndex, 1)"
                >下移</el-button>
                <el-button type="danger" plain @click="removeProject(selectedProjectIndex)">删除</el-button>
              </div>
            </div>
            <BaseCard>
              <el-form label-position="top">
                <el-form-item label="标题">
                  <el-input v-model="editingProject.title" placeholder="PlankBevelen Blog" />
                </el-form-item>
                <el-form-item label="摘要">
                  <el-input v-model="editingProject.summary" placeholder="项目简述" />
                </el-form-item>
                <el-form-item label="描述">
                  <el-input v-model="editingProject.description" type="textarea" :rows="4" placeholder="项目详细说明" />
                </el-form-item>
                <div class="inline-grid">
                  <el-form-item label="周期">
                    <el-input v-model="editingProject.period" placeholder="2025 - Present" />
                  </el-form-item>
                  <el-form-item label="状态">
                    <el-input v-model="editingProject.status" placeholder="In progress" />
                  </el-form-item>
                </div>
                <div class="inline-grid">
                  <el-form-item label="Repo URL">
                    <el-input v-model="editingProject.links.repoUrl" placeholder="https://github.com/..." />
                  </el-form-item>
                  <el-form-item label="Demo URL">
                    <el-input v-model="editingProject.links.demoUrl" placeholder="https://..." />
                  </el-form-item>
                </div>
                <div class="inline-grid">
                  <el-form-item label="主题色">
                    <el-input v-model="editingProject.accentColor" placeholder="#0f766e" />
                  </el-form-item>
                  <el-form-item label="排序">
                    <el-input-number v-model="editingProject.sort" :min="1" :max="999" />
                  </el-form-item>
                </div>
                <el-form-item label="标签">
                  <el-select
                    v-model="editingProject.tags"
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
                    :model-value="editingProject.highlights.join('\n')"
                    type="textarea"
                    :rows="5"
                    placeholder="每行一条亮点"
                    @update:model-value="updateHighlights(editingProject, $event)"
                  />
                </el-form-item>
              </el-form>
            </BaseCard>
          </template>
          <BaseCard v-else>
            <el-empty description="请从左侧选择一个项目" />
          </BaseCard>
        </div>
      </template>
    </LayoutTwoColumn>
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

type SectionKey = 'about' | 'timeline' | 'projects'

const loading = ref(false)
const saving = ref(false)
const activeSection = ref<SectionKey>('about')
const selectedTimelineIndex = ref<number | null>(null)
const selectedProjectIndex = ref<number | null>(null)

const createLocalizedText = (): SiteLocalizedText => ({ zh: '', en: '' })

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
  links: { repoUrl: '', demoUrl: '' },
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
  highlights: Array.isArray(project.highlights) ? project.highlights.map(item => String(item).trim()).filter(Boolean) : [],
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
  pages: { about: createLocalizedText(), timeline: createLocalizedText() },
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
      timeline: normalizeLocalizedText(content?.pages?.timeline)
    },
    timeline: timeline.sort((a, b) => a.sort - b.sort).map((item, index) => ({ ...item, sort: index + 1 })),
    projects: projects.sort((a, b) => a.sort - b.sort).map((project, index) => ({ ...project, sort: index + 1 })),
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

const sections = computed(() => [
  { key: 'about' as const, label: '关于页面', count: 1 },
  { key: 'timeline' as const, label: '时间线', count: form.value.timeline.length },
  { key: 'projects' as const, label: '项目', count: form.value.projects.length }
])

const summaryCards = computed(() => [
  { key: 'timeline', label: '时间线条目', value: form.value.timeline.length, desc: '前台时间线数量' },
  { key: 'projects', label: '项目数量', value: form.value.projects.length, desc: '项目列表条目' }
])

const editingTimelineItem = computed(() => {
  if (selectedTimelineIndex.value === null) return null
  return form.value.timeline[selectedTimelineIndex.value] ?? null
})

const editingProject = computed(() => {
  if (selectedProjectIndex.value === null) return null
  return form.value.projects[selectedProjectIndex.value] ?? null
})

const syncTimelineSort = () => {
  form.value.timeline = form.value.timeline.map((item, index) => ({ ...item, sort: index + 1 }))
}

const syncProjectSort = () => {
  form.value.projects = form.value.projects.map((project, index) => ({ ...project, sort: index + 1 }))
}

const switchSection = (key: SectionKey) => {
  activeSection.value = key
  selectedTimelineIndex.value = null
  selectedProjectIndex.value = null
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
  selectedTimelineIndex.value = form.value.timeline.length - 1
}

const removeTimeline = (index: number) => {
  form.value.timeline.splice(index, 1)
  syncTimelineSort()
  if (selectedTimelineIndex.value !== null) {
    if (form.value.timeline.length === 0) {
      selectedTimelineIndex.value = null
    } else if (selectedTimelineIndex.value >= form.value.timeline.length) {
      selectedTimelineIndex.value = form.value.timeline.length - 1
    }
  }
}

const moveTimeline = (index: number, step: number) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= form.value.timeline.length) return
  const next = [...form.value.timeline]
  const [current] = next.splice(index, 1)
  next.splice(targetIndex, 0, current)
  form.value.timeline = next
  syncTimelineSort()
  selectedTimelineIndex.value = targetIndex
}

const addProject = () => {
  form.value.projects.push(createProject(form.value.projects.length))
  syncProjectSort()
  selectedProjectIndex.value = form.value.projects.length - 1
}

const removeProject = (index: number) => {
  form.value.projects.splice(index, 1)
  syncProjectSort()
  if (selectedProjectIndex.value !== null) {
    if (form.value.projects.length === 0) {
      selectedProjectIndex.value = null
    } else if (selectedProjectIndex.value >= form.value.projects.length) {
      selectedProjectIndex.value = form.value.projects.length - 1
    }
  }
}

const moveProject = (index: number, step: number) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= form.value.projects.length) return
  const next = [...form.value.projects]
  const [current] = next.splice(index, 1)
  next.splice(targetIndex, 0, current)
  form.value.projects = next
  syncProjectSort()
  selectedProjectIndex.value = targetIndex
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
    return
  }

  const hasUntitledProject = form.value.projects.some(project => !project.title.trim())
  if (hasUntitledProject) {
    ElMessage.warning('项目标题不能为空')
    return
  }

  saving.value = true
  try {
    const payload: SiteContent = {
      about: { zh: form.value.about.zh, en: form.value.about.en },
      pages: {
        about: { zh: form.value.pages.about.zh, en: form.value.pages.about.en },
        timeline: { zh: form.value.pages.timeline.zh, en: form.value.pages.timeline.en }
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
.section-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--secondary-color);
  font-size: @base-font-size;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--text-color);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }
}

.nav-count {
  font-size: @font-size-xs;
  background: var(--el-fill-color);
  color: var(--secondary-color);
  padding: 2px 8px;
  border-radius: 10px;
}

.section-nav-item.active .nav-count {
  background: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}

.card-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.card-list-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 420px;
  overflow-y: auto;
}

.card-list-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--secondary-color);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  gap: 2px;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--text-color);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.item-label {
  font-size: @font-size-sm;
  font-weight: 600;
}

.item-sublabel {
  font-size: @font-size-xs;
  color: var(--tertiary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.section-title {
  margin: 0;
  font-size: @font-size-xl;
  font-weight: 600;
  color: var(--text-color);
}

.section-desc {
  margin: 6px 0 0;
  font-size: @font-size-sm;
  color: var(--tertiary-color);
}

.section-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-label {
  font-size: @font-size-sm;
  color: var(--secondary-color);
  margin-bottom: 8px;
  font-weight: 500;
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.content-editor {
  height: 420px;
}

@media (max-width: 1100px) {
  .editor-grid,
  .inline-grid {
    grid-template-columns: 1fr;
  }
}
</style>
