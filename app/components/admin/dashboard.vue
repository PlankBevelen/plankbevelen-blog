<template>
  <div class="space-y-6">
    <section class="hero-panel">
      <div>
        <p class="hero-kicker">内容运营概览</p>
        <h1 class="hero-title">欢迎回来，今天也来整理一下博客内容吧。</h1>
        <p class="hero-desc">
          这里汇总了文章、分类、标签和最近发布趋势，方便你快速掌握后台状态。
        </p>
      </div>

      <div class="hero-actions">
        <div class="hero-meta">
          <span>最后更新</span>
          <strong>{{ lastUpdatedText }}</strong>
        </div>
        <el-button :loading="loading" @click="fetchData">刷新数据</el-button>
        <el-button type="primary" @click="navigateTo('/admin/content/article/edit')">
          新建文章
        </el-button>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <BaseCard v-for="item in overviewItems" :key="item.key">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs text-mute">{{ item.title }}</p>
            <div class="mt-2 text-h1 font-semibold text-text">{{ item.value }}</div>
            <div class="mt-1 text-xs text-mute">{{ item.desc }}</div>
          </div>
          <el-tag :type="item.tagType">{{ item.tagText }}</el-tag>
        </div>
        <div class="mt-4">
          <el-button link type="primary" @click="item.onClick">立即查看</el-button>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <BaseCard class="xl:col-span-2">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>近 6 个月发布趋势</span>
            <el-button link type="primary" @click="navigateTo('/admin/content/statistics')">
              查看详情
            </el-button>
          </div>
        </template>
        <div ref="trendChartRef" class="h-72 w-full"></div>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>快捷操作</span>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <el-button
            v-for="action in quickActions"
            :key="action.key"
            :type="action.type"
            plain
            @click="action.onClick"
          >
            {{ action.label }}
          </el-button>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <BaseCard class="xl:col-span-2">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>最近更新的文章</span>
            <el-button link type="primary" @click="navigateTo('/admin/content/article')">
              全部文章
            </el-button>
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

      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>内容分布</span>
            <el-button link type="primary" @click="navigateTo('/admin/content/statistics')">
              更多图表
            </el-button>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { navigateTo } from '#app'
import { useAdminStore } from '@/stores/admin.store'
import { formatDate } from '@/utils/format'
import { http } from '@/utils/http'

type DashboardTrendItem = { date: string; count: number }
type DashboardStatItem = { name: string; value: number }
type DashboardRecentArticle = { id: string | number; title: string; created_at: string }
type DashboardData = {
  totalArticles: number
  totalCategories: number
  totalTags: number
  recentArticles: DashboardRecentArticle[]
  publishTrend: DashboardTrendItem[]
  categoryStats: DashboardStatItem[]
  tagStats: DashboardStatItem[]
}

const stats = ref<DashboardData>({
  totalArticles: 0,
  totalCategories: 0,
  totalTags: 0,
  recentArticles: [],
  publishTrend: [],
  categoryStats: [],
  tagStats: []
})

const trendChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
const tagChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let tagChart: echarts.ECharts | null = null

const adminStore = useAdminStore()
const themeKey = computed(() => adminStore.getTheme)

const loading = ref(false)
const lastUpdatedAt = ref<number | null>(null)
const activeDistTab = ref<'category' | 'tag'>('category')

const lastUpdatedText = computed(() => {
  if (!lastUpdatedAt.value) return '尚未刷新'
  return `${formatDate(new Date(lastUpdatedAt.value))} ${new Date(lastUpdatedAt.value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })}`
})

const cssVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const disposeCharts = () => {
  trendChart?.dispose()
  categoryChart?.dispose()
  tagChart?.dispose()
  trendChart = null
  categoryChart = null
  tagChart = null
}

const initTrendChart = () => {
  if (!trendChartRef.value) return

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

const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  const cardBg = cssVar('--card-color', '#fff')
  const text = cssVar('--text-color', '#212529')
  const secondary = cssVar('--secondary-color', '#495057')

  if (!categoryChart) {
    categoryChart = echarts.init(categoryChartRef.value)
  }

  categoryChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '4%', left: 'center', textStyle: { color: secondary } },
    series: [
      {
        name: '分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
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

const initTagChart = () => {
  if (!tagChartRef.value) return

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
    grid: { left: '2%', right: '6%', bottom: '3%', containLabel: true },
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

const renderCharts = async () => {
  await nextTick()
  initTrendChart()
  if (activeDistTab.value === 'category') initCategoryChart()
  if (activeDistTab.value === 'tag') initTagChart()
}

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await http.get('/admin/dashboard')
    if (res?.data) {
      stats.value = res.data as DashboardData
      lastUpdatedAt.value = Date.now()
      await renderCharts()
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '获取仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

const onRowClick = (row: DashboardRecentArticle) => {
  navigateTo({
    path: '/admin/content/article/edit',
    query: { mode: 'update', id: row.id }
  })
}

const onDistTabChange = async () => {
  await nextTick()
  if (activeDistTab.value === 'category') initCategoryChart()
  if (activeDistTab.value === 'tag') initTagChart()
  categoryChart?.resize()
  tagChart?.resize()
}

const handleResize = () => {
  trendChart?.resize()
  categoryChart?.resize()
  tagChart?.resize()
}

const overviewItems = computed(() => [
  {
    key: 'articles',
    title: '文章总数',
    tagText: 'Total',
    tagType: 'success' as const,
    value: stats.value.totalArticles,
    desc: '累计已收录的文章数量',
    onClick: () => navigateTo('/admin/content/article')
  },
  {
    key: 'categories',
    title: '分类总数',
    tagText: 'Category',
    tagType: 'warning' as const,
    value: stats.value.totalCategories,
    desc: '内容分类结构一目了然',
    onClick: () => navigateTo('/admin/content/category')
  },
  {
    key: 'tags',
    title: '标签总数',
    tagText: 'Tags',
    tagType: 'info' as const,
    value: stats.value.totalTags,
    desc: '标签覆盖了不同主题与关键词',
    onClick: () => navigateTo('/admin/content/statistics')
  },
  {
    key: 'recent',
    title: '近 6 月产出',
    tagText: 'Trend',
    tagType: 'primary' as const,
    value: stats.value.publishTrend.reduce((sum, item) => sum + item.count, 0),
    desc: '最近半年新增文章总量',
    onClick: () => navigateTo('/admin/content/statistics')
  }
])

const quickActions = computed(() => [
  {
    key: 'create-article',
    label: '新建文章',
    type: 'primary' as const,
    onClick: () => navigateTo('/admin/content/article/edit')
  },
  {
    key: 'manage-article',
    label: '文章管理',
    onClick: () => navigateTo('/admin/content/article')
  },
  {
    key: 'manage-category',
    label: '分类管理',
    onClick: () => navigateTo('/admin/content/category')
  },
  {
    key: 'statistics',
    label: '数据统计',
    onClick: () => navigateTo('/admin/content/statistics')
  },
  {
    key: 'site-info',
    label: '网站信息',
    onClick: () => navigateTo('/admin/site/info')
  },
  {
    key: 'site-data',
    label: '网站数据',
    onClick: () => navigateTo('/admin/site/data')
  }
])

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
.hero-panel {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  border-radius: 24px;
  border: 1px solid rgba(0, 105, 217, 0.12);
  background:
    radial-gradient(circle at top right, rgba(0, 105, 217, 0.12), transparent 28%),
    radial-gradient(circle at bottom left, rgba(25, 135, 84, 0.12), transparent 22%),
    linear-gradient(135deg, var(--card-color), color-mix(in srgb, var(--card-color) 88%, #eaf2ff));
}

.hero-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.hero-title {
  margin: 0;
  font-size: clamp(26px, 4vw, 34px);
  line-height: 1.15;
  color: var(--text-color);
}

.hero-desc {
  margin: 12px 0 0;
  max-width: 680px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.hero-meta {
  display: flex;
  flex-direction: column;
  min-width: 128px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: var(--secondary-color);
  font-size: 12px;

  strong {
    margin-top: 4px;
    color: var(--text-color);
    font-size: 14px;
  }
}

@media (max-width: 960px) {
  .hero-panel {
    flex-direction: column;
  }

  .hero-actions {
    justify-content: flex-start;
  }
}
</style>
