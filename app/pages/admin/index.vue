<template>
  <div class="overview-page space-y-4">
    <div class="page-intro">
      <h2 class="page-title">概览</h2>
      <p class="page-desc">内容量与近 30 日流量摘要</p>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <BaseCard v-for="item in overviewItems" :key="item.key">
        <p class="text-xs text-mute">{{ item.title }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ item.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ item.desc }}</div>
        <div class="mt-3">
          <el-button link type="primary" @click="item.onClick">{{ item.action }}</el-button>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <BaseCard class="xl:col-span-2">
        <template #header>
          <span>近 6 个月发布趋势</span>
        </template>
        <div ref="trendChartRef" class="h-72 w-full"></div>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>快捷操作</span>
        </template>
        <div class="grid grid-cols-1 gap-2">
          <el-button
            v-for="action in quickActions"
            :key="action.key"
            :type="action.type"
            plain
            class="w-full"
            @click="action.onClick"
          >
            {{ action.label }}
          </el-button>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>热门页面</span>
            <el-button link type="primary" @click="navigateTo('/admin/site/logs')">访问明细</el-button>
          </div>
        </template>
        <div v-if="stats.visitSummary.topPaths.length" class="top-paths">
          <div v-for="item in stats.visitSummary.topPaths" :key="item.path" class="top-path-row">
            <span class="path">{{ item.path }}</span>
            <strong>{{ item.count }}</strong>
          </div>
        </div>
        <el-empty v-else description="近 30 日暂无访问" :image-size="72" />
      </BaseCard>

      <BaseCard class="xl:col-span-2">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>最近更新的文章</span>
            <el-button link type="primary" @click="navigateTo('/admin/content/article')">全部文章</el-button>
          </div>
        </template>
        <el-table
          :data="stats.recentArticles"
          :show-header="false"
          style="width: 100%"
          v-loading="loading"
          @row-click="onRowClick"
        >
          <el-table-column prop="title" label="标题" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="text-sm font-medium text-text">{{ row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="时间" width="120" align="right">
            <template #default="{ row }">
              <span class="text-xs text-mute">{{ formatDate(row.created_at) }}</span>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有文章，先去写一篇吧" />
          </template>
        </el-table>
      </BaseCard>
    </div>

    <BaseCard>
      <template #header>
        <span>内容分布</span>
      </template>
      <el-tabs v-model="activeDistTab" @tab-change="onDistTabChange">
        <el-tab-pane label="分类" name="category">
          <div ref="categoryChartRef" class="h-64 w-full"></div>
        </el-tab-pane>
        <el-tab-pane label="标签" name="tag">
          <div ref="tagChartRef" class="h-64 w-full"></div>
        </el-tab-pane>
      </el-tabs>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { navigateTo } from '#app'
import { useAdminStore } from '@/stores/admin.store'
import { formatDate } from '@/utils/format'
import adminService from '@/services/admin'
import type { AdminDashboardResponse } from '@/types/response/admin'
import { toApiError } from '@/utils/api-error'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const emptyVisitSummary: AdminDashboardResponse['visitSummary'] = {
  totalVisits: 0,
  uniqueVisitors: 0,
  todayVisits: 0,
  averageDurationMs: 0,
  latestVisitedAt: null,
  topPaths: [],
  days: 30
}

const stats = ref<AdminDashboardResponse>({
  totalArticles: 0,
  totalCategories: 0,
  totalTags: 0,
  recentArticles: [],
  publishTrend: [],
  categoryStats: [],
  tagStats: [],
  visitSummary: { ...emptyVisitSummary }
})

const trendChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
const tagChartRef = ref<HTMLElement>()

let echarts: any = null
const loadEcharts = async () => {
  if (!echarts) echarts = await import('echarts')
}

let trendChart: any = null
let categoryChart: any = null
let tagChart: any = null

const adminStore = useAdminStore()
const themeKey = computed(() => adminStore.getTheme)
const loading = ref(false)
const activeDistTab = ref<'category' | 'tag'>('category')

function cssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function disposeCharts() {
  trendChart?.dispose()
  categoryChart?.dispose()
  tagChart?.dispose()
  trendChart = null
  categoryChart = null
  tagChart = null
}

async function initTrendChart() {
  if (!trendChartRef.value) return
  await loadEcharts()

  const primary = cssVar('--primary-color', '#0069d9')
  const primary06 = cssVar('--primary-color-06', 'rgba(0, 105, 217, 0.6)')
  const border = cssVar('--border-color', '#dee2e6')
  const text = cssVar('--text-color', '#212529')
  const mute = cssVar('--mute-color', '#6c757d')
  const dates = stats.value.publishTrend.map(item => item.date)
  const counts = stats.value.publishTrend.map(item => item.count)

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: border } },
      axisLabel: { color: mute }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: border } },
      axisLabel: { color: mute }
    },
    series: [
      {
        name: '发布数量',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { color: primary, width: 2 },
        itemStyle: { color: primary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: primary06 },
            { offset: 1, color: 'transparent' }
          ])
        },
        data: counts
      }
    ],
    textStyle: { color: text }
  })
}

async function initCategoryChart() {
  if (!categoryChartRef.value) return
  await loadEcharts()

  const cardBg = cssVar('--card-color', '#fff')
  const text = cssVar('--text-color', '#212529')
  const secondary = cssVar('--secondary-color', '#495057')

  if (!categoryChart) {
    categoryChart = echarts.init(categoryChartRef.value)
  }

  categoryChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center', textStyle: { color: secondary } },
    series: [
      {
        name: '分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['45%', '40%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: cardBg,
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 18, fontWeight: 'bold', color: text }
        },
        data: stats.value.categoryStats
      }
    ],
    textStyle: { color: text },
    backgroundColor: 'transparent'
  })
}

async function initTagChart() {
  if (!tagChartRef.value) return
  await loadEcharts()

  const primary = cssVar('--primary-color', '#0069d9')
  const border = cssVar('--border-color', '#dee2e6')
  const mute = cssVar('--mute-color', '#6c757d')
  const text = cssVar('--text-color', '#212529')
  const tagNames = stats.value.tagStats.map(t => t.name).reverse()
  const tagValues = stats.value.tagStats.map(t => t.value).reverse()

  if (!tagChart) {
    tagChart = echarts.init(tagChartRef.value)
  }

  tagChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '2%', right: '6%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: border } },
      axisLabel: { color: mute },
      splitLine: { lineStyle: { type: 'dashed', color: border } }
    },
    yAxis: {
      type: 'category',
      data: tagNames,
      axisLine: { lineStyle: { color: border } },
      axisLabel: { color: mute }
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: tagValues,
        itemStyle: { color: primary },
        barMaxWidth: 18
      }
    ],
    textStyle: { color: text }
  })
}

async function renderCharts() {
  await nextTick()
  await initTrendChart()
  if (activeDistTab.value === 'category') await initCategoryChart()
  if (activeDistTab.value === 'tag') await initTagChart()
}

async function fetchData() {
  loading.value = true
  try {
    const data = (await adminService.getDashboard()) as AdminDashboardResponse
    stats.value = {
      ...data,
      visitSummary: data.visitSummary || { ...emptyVisitSummary }
    }
    await renderCharts()
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '获取概览数据失败')
  } finally {
    loading.value = false
  }
}

function onRowClick(row: AdminDashboardResponse['recentArticles'][number]) {
  navigateTo({
    path: '/admin/content/article/edit',
    query: { mode: 'update', id: row.id }
  })
}

async function onDistTabChange() {
  await nextTick()
  if (activeDistTab.value === 'category') await initCategoryChart()
  if (activeDistTab.value === 'tag') await initTagChart()
  categoryChart?.resize()
  tagChart?.resize()
}

function handleResize() {
  trendChart?.resize()
  categoryChart?.resize()
  tagChart?.resize()
}

const overviewItems = computed(() => [
  {
    key: 'articles',
    title: '文章',
    value: stats.value.totalArticles,
    desc: `${stats.value.totalCategories} 个分类 · ${stats.value.totalTags} 个标签`,
    action: '管理文章',
    onClick: () => navigateTo('/admin/content/article')
  },
  {
    key: 'pv',
    title: '近 30 日访问',
    value: stats.value.visitSummary.totalVisits,
    desc: `今日 ${stats.value.visitSummary.todayVisits} 次`,
    action: '查看访问',
    onClick: () => navigateTo('/admin/site/logs')
  },
  {
    key: 'uv',
    title: '近 30 日访客',
    value: stats.value.visitSummary.uniqueVisitors,
    desc: '同浏览器 Cookie 去重',
    action: '访问明细',
    onClick: () => navigateTo('/admin/site/logs')
  },
  {
    key: 'trend',
    title: '近 6 月产出',
    value: stats.value.publishTrend.reduce((sum, item) => sum + item.count, 0),
    desc: '半年新增文章',
    action: '写新文章',
    onClick: () => navigateTo('/admin/content/article/edit')
  }
])

const quickActions = [
  {
    key: 'create-article',
    label: '新建文章',
    type: 'primary' as const,
    onClick: () => navigateTo('/admin/content/article/edit')
  },
  {
    key: 'manage-category',
    label: '分类管理',
    type: undefined,
    onClick: () => navigateTo('/admin/content/category')
  },
  {
    key: 'site-content',
    label: '站点内容',
    type: undefined,
    onClick: () => navigateTo('/admin/site/content')
  },
  {
    key: 'settings',
    label: '设置',
    type: undefined,
    onClick: () => navigateTo('/admin/site/settings')
  }
]

watch(themeKey, async () => {
  if (typeof window === 'undefined') return
  disposeCharts()
  await renderCharts()
})

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})
</script>

<style scoped lang="less">
.page-intro {
  margin-bottom: @space-base;
}

.page-title {
  margin: 0;
  font-size: @font-size-xl;
  color: var(--text-color);
}

.page-desc {
  margin: @space-2xs 0 0;
  font-size: @font-size-sm;
  color: var(--secondary-color);
}

.top-paths {
  display: flex;
  flex-direction: column;
  gap: @space-md;
}

.top-path-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-lg;

  .path {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-color);
    font-size: @font-size-sm;
  }

  strong {
    flex-shrink: 0;
    color: var(--primary-color);
  }
}
</style>
