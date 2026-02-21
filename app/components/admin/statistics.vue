<template>
  <div class="statistics">
    <div class="header">
      <h2 class="title">数据统计</h2>
    </div>

    <div class="charts-grid">
      <!-- 分类占比 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>分类文章占比</span>
          </div>
        </template>
        <div ref="categoryChartRef" class="chart-container"></div>
      </el-card>

      <!-- 热门标签 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>热门标签 Top 10</span>
          </div>
        </template>
        <div ref="tagChartRef" class="chart-container"></div>
      </el-card>
      
      <!-- 发布趋势 -->
      <el-card shadow="hover" class="chart-card full-width">
        <template #header>
          <div class="card-header">
            <span>内容发布趋势</span>
          </div>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { http } from '@/utils/http'

const categoryChartRef = ref<HTMLElement>()
const tagChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

let categoryChart: echarts.ECharts | null = null
let tagChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

const initCharts = (data: any) => {
  // 1. 分类饼图
  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value)
    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center' },
      series: [
        {
          name: '文章分类',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 20, fontWeight: 'bold' }
          },
          data: data.categoryStats
        }
      ]
    })
  }

  // 2. 标签柱状图
  if (tagChartRef.value) {
    tagChart = echarts.init(tagChartRef.value)
    const tagNames = data.tagStats.map((t: any) => t.name).reverse()
    const tagValues = data.tagStats.map((t: any) => t.value).reverse()
    
    tagChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: tagNames },
      series: [
        {
          name: '使用次数',
          type: 'bar',
          data: tagValues,
          itemStyle: { color: '#67C23A' }
        }
      ]
    })
  }

  // 3. 趋势折线图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    const dates = data.publishTrend.map((item: any) => item.date)
    const counts = data.publishTrend.map((item: any) => item.count)

    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: dates },
      yAxis: { type: 'value' },
      series: [
        {
          name: '文章数',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#E6A23C' },
          data: counts
        }
      ]
    })
  }
}

const fetchData = async () => {
  try {
    const res: any = await http.get('/admin/dashboard')
    if (res?.data) {
      setTimeout(() => initCharts(res.data), 100)
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
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
.statistics {
  padding: 0 0 24px 0;

  .header {
    margin-bottom: 24px;
    .title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    .chart-card {
      height: 400px;
      display: flex;
      flex-direction: column;
      
      &.full-width {
        grid-column: span 2;
      }

      :deep(.el-card__body) {
        flex: 1;
        padding: 10px;
      }

      .chart-container {
        width: 100%;
        height: 100%;
      }
    }
  }
}

@media (max-width: 1024px) {
  .statistics {
    .charts-grid {
      grid-template-columns: 1fr;
      .chart-card.full-width {
        grid-column: span 1;
      }
    }
  }
}
</style>
