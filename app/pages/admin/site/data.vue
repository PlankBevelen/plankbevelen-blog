<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <BaseCard class="xl:col-span-2">
        <template #header>
          <span>近 30 天发文趋势</span>
        </template>
        <div ref="trendChartRef" class="chart-box"></div>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>资源体积分布</span>
        </template>
        <div ref="assetChartRef" class="chart-box"></div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <BaseCard>
        <template #header>
          <span>访问统计</span>
        </template>
        <el-alert
          :title="metrics.traffic.statusText"
          type="warning"
          :closable="false"
          show-icon
        />
        <div class="traffic-grid">
          <div class="traffic-item">
            <span>PV</span>
            <strong>{{ metrics.traffic.pv ?? '--' }}</strong>
          </div>
          <div class="traffic-item">
            <span>UV</span>
            <strong>{{ metrics.traffic.uv ?? '--' }}</strong>
          </div>
        </div>
        <p class="panel-note">{{ metrics.traffic.source }}</p>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>当前页面性能</span>
        </template>
        <div class="perf-grid">
          <div v-for="item in browserPerformanceCards" :key="item.key" class="perf-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import siteService from '@/services/site.service'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const metrics = ref({
  traffic: {
    analyticsEnabled: false,
    statusText: '未接入实时访问埋点',
    source: '',
    pv: null as number | null,
    uv: null as number | null
  },
  content: {
    totalArticles: 0,
    articlesLast30Days: 0,
    averageContentLength: 0
  },
  assets: {
    publicFiles: 0,
    publicSize: 0,
    uploadFiles: 0,
    uploadSize: 0,
    bundleFiles: 0,
    bundleSize: 0
  },
  publishTrend: [] as Array<{ date: string; count: number }>
})

const loading = ref(false)
const trendChartRef = ref<HTMLElement>()
const assetChartRef = ref<HTMLElement>()
const browserPerformance = ref({
  ttfb: 0,
  domReady: 0,
  load: 0,
  transferSize: 0
})

let echarts: any = null
const loadEcharts = async () => {
  if (!echarts) {
    echarts = await import('echarts')
  }
}

let trendChart: any = null
let assetChart: any = null

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

const summaryCards = computed(() => [
  {
    key: 'articles',
    label: '近 30 天发文',
    value: metrics.value.content.articlesLast30Days,
    desc: '最近一个月新增文章数'
  },
  {
    key: 'words',
    label: '平均正文长度',
    value: `${metrics.value.content.averageContentLength} 字`,
    desc: '按历史文章正文长度估算'
  },
  {
    key: 'bundle',
    label: '构建产物体积',
    value: formatBytes(metrics.value.assets.bundleSize),
    desc: `${metrics.value.assets.bundleFiles} 个前端构建文件`
  },
  {
    key: 'uploads',
    label: '上传资源体积',
    value: formatBytes(metrics.value.assets.uploadSize),
    desc: `${metrics.value.assets.uploadFiles} 个上传文件`
  }
])

const browserPerformanceCards = computed(() => [
  {
    key: 'ttfb',
    label: 'TTFB',
    value: `${browserPerformance.value.ttfb} ms`
  },
  {
    key: 'dom',
    label: 'DOM Ready',
    value: `${browserPerformance.value.domReady} ms`
  },
  {
    key: 'load',
    label: 'Load',
    value: `${browserPerformance.value.load} ms`
  },
  {
    key: 'transfer',
    label: 'Transfer',
    value: formatBytes(browserPerformance.value.transferSize)
  }
])

const initCharts = async () => {
  await nextTick()
  await loadEcharts()
  const primary = '#0069d9'
  const success = '#198754'
  const warning = '#e6a23c'
  const border = '#d9dee7'
  const mute = '#667085'

  if (trendChartRef.value) {
    trendChart?.dispose()
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: metrics.value.publishTrend.map(item => item.date.slice(5)),
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
          name: '发文量',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: metrics.value.publishTrend.map(item => item.count),
          lineStyle: { color: primary, width: 2 },
          areaStyle: { color: 'rgba(0, 105, 217, 0.14)' },
          itemStyle: { color: primary }
        }
      ]
    })
  }

  if (assetChartRef.value) {
    assetChart?.dispose()
    assetChart = echarts.init(assetChartRef.value)
    assetChart.setOption({
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['42%', '72%'],
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { formatter: '{b}\n{d}%' },
          data: [
            { name: '公共资源', value: metrics.value.assets.publicSize, itemStyle: { color: primary } },
            { name: '上传资源', value: metrics.value.assets.uploadSize, itemStyle: { color: success } },
            { name: '构建产物', value: metrics.value.assets.bundleSize, itemStyle: { color: warning } }
          ]
        }
      ]
    })
  }
}

const collectBrowserPerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return
  const navigation = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  if (!navigation) return

  browserPerformance.value = {
    ttfb: Math.max(0, Math.round(navigation.responseStart - navigation.requestStart)),
    domReady: Math.max(0, Math.round(navigation.domContentLoadedEventEnd - navigation.startTime)),
    load: Math.max(0, Math.round(navigation.loadEventEnd - navigation.startTime)),
    transferSize: Number(navigation.transferSize || 0)
  }
}

const fetchMetrics = async () => {
  loading.value = true
  try {
    const res: any = await siteService.getMetrics()
    if (res?.status === 200 && res.data) {
      metrics.value = res.data
      await initCharts()
      return
    }
    ElMessage.error(res?.msg || '获取网站数据失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '获取网站数据失败')
  } finally {
    loading.value = false
  }
}

const handleResize = () => {
  trendChart?.resize()
  assetChart?.resize()
}

onMounted(async () => {
  await fetchMetrics()
  collectBrowserPerformance()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  trendChart?.dispose()
  assetChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="less">
.data-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: @space-3xl;
  padding: @space-4xl 28px;
  border-radius: @radius-xl;
  border: 1px solid rgba(25, 135, 84, 0.14);
  background:
    radial-gradient(circle at top right, rgba(25, 135, 84, 0.16), transparent 24%),
    linear-gradient(140deg, var(--card-color), color-mix(in srgb, var(--card-color) 88%, #eefaf3));
}

.data-kicker {
  margin: 0 0 @space-base;
  font-size: @font-size-xs;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #198754;
}

.data-title {
  margin: 0;
  font-size: @font-size-3xl;
  color: var(--text-color);
}

.data-desc {
  margin: @space-lg 0 0;
  max-width: 680px;
  font-size: @font-size-sm;
  line-height: 1.8;
  color: var(--secondary-color);
}

.chart-box {
  width: 100%;
  height: 340px;
}

.traffic-grid,
.perf-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: @space-2xl;
  margin-top: 18px;
}

.traffic-item,
.perf-item {
  padding: @space-2xl;
  border-radius: 18px;
  background: var(--bg-color, #f7f9fc);
  border: 1px solid var(--border-color);

  span {
    display: block;
    font-size: @font-size-xs;
    color: var(--tertiary-color);
  }

  strong {
    display: block;
    margin-top: @space-base;
    font-size: @font-size-xl;
    color: var(--text-color);
  }
}

.panel-note {
  margin: @space-2xl 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--tertiary-color);
}

@media (max-width: @screen-tablet) {
  .data-hero {
    flex-direction: column;
  }

  .traffic-grid,
  .perf-grid {
    grid-template-columns: 1fr;
  }
}
</style>
