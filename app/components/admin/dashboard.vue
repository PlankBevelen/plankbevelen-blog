<template>
  <div class="space-y-6">
    <div class="flex items-center justify-end gap-3">
      <div class="text-xs text-mute">最后更新：{{ lastUpdatedText }}</div>
      <el-button :loading="loading" @click="fetchData">刷新</el-button>
      <el-button type="primary" @click="navigateTo('/admin/content/article/edit')">新建文章</el-button>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <BaseCard v-for="item in overviewItems" :key="item.key">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span class="truncate">{{ item.title }}</span>
            <el-tag :type="item.tagType">{{ item.tagText }}</el-tag>
          </div>
        </template>
        <div class="flex items-end justify-between gap-4">
          <div>
            <div class="text-h1 font-semibold text-text">{{ item.value }}</div>
            <div class="mt-1 text-xs text-mute">{{ item.desc }}</div>
          </div>
          <el-button link type="primary" @click="item.onClick">查看</el-button>
        </div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <BaseCard class="xl:col-span-2">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>发布趋势（近 6 个月）</span>
            <el-button link type="primary" @click="navigateTo('/admin/content/statistics')">更多</el-button>
          </div>
        </template>
        <div ref="trendChartRef" class="h-72 w-full"></div>
      </BaseCard>

      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>快捷操作</span>
          </div>
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
            <span>最新文章</span>
            <el-button link type="primary" @click="navigateTo('/admin/content/article')">全部</el-button>
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
            <el-empty description="暂无文章"></el-empty>
          </template>
        </el-table>
      </BaseCard>

      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <span>内容分布</span>
            <el-button link type="primary" @click="navigateTo('/admin/content/statistics')">更多</el-button>
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
import { navigateTo } from '#app'
import { http } from '@/utils/http'
import { formatDate } from '@/utils/format'
import { useAdminStore } from '@/stores/admin.store'
import { ElMessage } from 'element-plus'

type DashboardTrendItem = { date: string; count: number }
type DashboardStatItem = { name: string; value: number }
type DashboardRecentArticle = { id: string | number; title: string; created_at: string; category_id?: number }
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
const lastUpdatedText = computed(() => {
  if (!lastUpdatedAt.value) return '—'
  return formatDate(new Date(lastUpdatedAt.value))
})

const activeDistTab = ref<'category' | 'tag'>('category')

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
  const border = cssVar('--border-color', '#dee2e6')
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
    desc: '篇已发布文章',
    onClick: () => navigateTo('/admin/content/article')
  },
  {
    key: 'categories',
    title: '分类总数',
    tagText: 'Category',
    tagType: 'warning' as const,
    value: stats.value.totalCategories,
    desc: '个活跃分类',
    onClick: () => navigateTo('/admin/content/category')
  },
  {
    key: 'tags',
    title: '标签总数',
    tagText: 'Tags',
    tagType: 'info' as const,
    value: stats.value.totalTags,
    desc: '个内容标签',
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

<style scoped lang="less"></style>
