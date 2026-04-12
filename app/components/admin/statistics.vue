<template>
  <div class="space-y-6">
    <section class="stats-hero">
      <div>
        <p class="stats-kicker">Content Analytics</p>
        <h2 class="stats-title">内容数据统计</h2>
        <p class="stats-desc">
          从分类占比、热门标签和发布趋势三个角度，快速了解后台内容结构。
        </p>
      </div>
      <el-button :loading="loading" @click="fetchData">刷新统计</el-button>
    </section>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <div class="charts-grid">
      <BaseCard>
        <template #header>
          <span>分类文章占比</span>
        </template>
        <div ref="categoryChartRef" class="chart-container"></div>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>热门标签 Top 10</span>
        </template>
        <div ref="tagChartRef" class="chart-container"></div>
      </BaseCard>

      <BaseCard class="full-width">
        <template #header>
          <span>内容发布趋势</span>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/utils/http'

type StatItem = { name: string; value: number }
type TrendItem = { date: string; count: number }
type DashboardData = {
  totalArticles: number
  totalCategories: number
  totalTags: number
  categoryStats: StatItem[]
  tagStats: StatItem[]
  publishTrend: TrendItem[]
}

const categoryChartRef = ref<HTMLElement>()
const tagChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
let echarts: any = null
const loadEcharts = async () => {
  if (!echarts) echarts = await import('echarts')
}
const loading = ref(false)

const data = ref<DashboardData>({
  totalArticles: 0,
  totalCategories: 0,
  totalTags: 0,
  categoryStats: [],
  tagStats: [],
  publishTrend: []
})

let categoryChart: any = null
let tagChart: any = null
let trendChart: any = null

const cssVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const summaryCards = computed(() => {
  const hottestCategory = data.value.categoryStats[0]
  const hottestTag = data.value.tagStats[0]
  const latestMonth = data.value.publishTrend[data.value.publishTrend.length - 1]

  return [
    {
      key: 'category',
      label: '最多文章分类',
      value: hottestCategory?.name || '暂无',
      desc: hottestCategory ? `${hottestCategory.value} 篇文章` : '等待内容数据'
    },
    {
      key: 'tag',
      label: '最活跃标签',
      value: hottestTag?.name || '暂无',
      desc: hottestTag ? `累计使用 ${hottestTag.value} 次` : '等待内容数据'
    },
    {
      key: 'trend',
      label: '最近月份产出',
      value: latestMonth?.count ?? 0,
      desc: latestMonth ? `${latestMonth.date} 的新增文章数` : '等待内容数据'
    }
  ]
})

const initCharts = async () => {
  await nextTick()
  await loadEcharts()

  const primary = cssVar('--primary-color', '#0069d9')
  const success = '#67c23a'
  const warning = '#e6a23c'
  const border = cssVar('--border-color', '#dee2e6')
  const text = cssVar('--text-color', '#212529')
  const mute = cssVar('--mute-color', '#6c757d')
  const cardBg = cssVar('--card-color', '#ffffff')

  if (categoryChartRef.value) {
    categoryChart?.dispose()
    categoryChart = echarts.init(categoryChartRef.value)
    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '4%', left: 'center', textStyle: { color: mute } },
      series: [
        {
          name: '分类文章占比',
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: cardBg,
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 18, fontWeight: 'bold', color: text }
          },
          data: data.value.categoryStats
        }
      ],
      textStyle: { color: text }
    })
  }

  if (tagChartRef.value) {
    tagChart?.dispose()
    tagChart = echarts.init(tagChartRef.value)
    const tagNames = data.value.tagStats.map(item => item.name).reverse()
    const tagValues = data.value.tagStats.map(item => item.value).reverse()

    tagChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '4%', right: '4%', bottom: '3%', containLabel: true },
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
          itemStyle: { color: success },
          barMaxWidth: 18
        }
      ],
      textStyle: { color: text }
    })
  }

  if (trendChartRef.value) {
    trendChart?.dispose()
    trendChart = echarts.init(trendChartRef.value)

    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.value.publishTrend.map(item => item.date),
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: mute }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: border } },
        axisLabel: { color: mute },
        splitLine: { lineStyle: { type: 'dashed', color: border } }
      },
      series: [
        {
          name: '文章数量',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: { opacity: 0.2, color: warning },
          itemStyle: { color: warning },
          lineStyle: { color: warning, width: 2 },
          data: data.value.publishTrend.map(item => item.count)
        }
      ],
      textStyle: { color: text }
    })
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await http.get('/admin/dashboard')
    if (res?.data) {
      data.value = res.data
      await initCharts()
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '获取统计数据失败')
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  categoryChart?.resize()
  tagChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  categoryChart?.dispose()
  tagChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped lang="less">
.stats-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at right top, rgba(230, 162, 60, 0.14), transparent 24%),
    linear-gradient(140deg, var(--card-color), color-mix(in srgb, var(--card-color) 85%, #fff7e6));
  border: 1px solid rgba(230, 162, 60, 0.18);
}

.stats-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #e6a23c;
}

.stats-title {
  margin: 0;
  font-size: 30px;
  color: var(--text-color);
}

.stats-desc {
  margin: 12px 0 0;
  max-width: 640px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.chart-container {
  width: 100%;
  height: 360px;
}

.full-width {
  grid-column: span 2;
}

@media (max-width: 1024px) {
  .stats-hero {
    flex-direction: column;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: span 1;
  }
}
</style>
