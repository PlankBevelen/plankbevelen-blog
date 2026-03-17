<template>
  <div class="dashboard">
    <div class="header">
      <h2 class="title">仪表盘</h2>
      <div class="actions">
        <el-button type="primary" @click="navigateTo('/admin/content/article/edit')">
          写文章
        </el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>文章总数</span>
            <el-tag type="success">Total</el-tag>
          </div>
        </template>
        <div class="card-content">
          <div class="number">{{ stats.totalArticles }}</div>
          <div class="desc">篇已发布文章</div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>分类总数</span>
            <el-tag type="warning">Category</el-tag>
          </div>
        </template>
        <div class="card-content">
          <div class="number">{{ stats.totalCategories }}</div>
          <div class="desc">个活跃分类</div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>标签总数</span>
            <el-tag type="info">Tags</el-tag>
          </div>
        </template>
        <div class="card-content">
          <div class="number">{{ stats.totalTags }}</div>
          <div class="desc">个内容标签</div>
        </div>
      </el-card>
    </div>

    <div class="dashboard-grid">
      <!-- 发布趋势图 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>发布趋势 (近6个月)</span>
          </div>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </el-card>

      <!-- 最新文章列表 -->
      <el-card shadow="hover" class="list-card">
        <template #header>
          <div class="card-header">
            <span>最新文章</span>
            <el-button link type="primary" @click="navigateTo('/admin/content/article')">全部</el-button>
          </div>
        </template>
        <el-table :data="stats.recentArticles" style="width: 100%" :show-header="false">
          <el-table-column prop="title" label="标题" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="article-title">{{ row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="时间" width="120" align="right">
            <template #default="{ row }">
              <span class="text-gray-400 text-xs">{{ formatDate(row.created_at) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { navigateTo } from '#app'
import { http } from '@/utils/http'

// 状态数据
const stats = ref({
  totalArticles: 0,
  totalCategories: 0,
  totalTags: 0,
  recentArticles: [],
  publishTrend: []
})

const trendChartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 格式化日期
const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD')

// 初始化图表
const initChart = () => {
  if (!trendChartRef.value) return
  
  chartInstance = echarts.init(trendChartRef.value)
  
  const dates = stats.value.publishTrend.map((item: any) => item.date)
  const counts = stats.value.publishTrend.map((item: any) => item.count)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [
      {
        name: '发布数量',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        itemStyle: { color: '#409EFF' },
        data: counts
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 获取数据
const fetchData = async () => {
  try {
    const res: any = await http.get('/admin/dashboard')
    // 后端返回格式为 { status: 200, msg: '...', data: { ... } }
    // http 工具返回的就是整个响应体
    if (res?.data) {
      stats.value = res.data
      setTimeout(initChart, 100)
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
}

// 监听窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped lang="less">
.dashboard {
  padding: 0 0 24px 0;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 24px;

    .stat-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
      }
      .card-content {
        text-align: center;
        padding: 10px 0;
        .number {
          font-size: 32px;
          font-weight: bold;
          color: var(--primary-color);
          line-height: 1.2;
        }
        .desc {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 4px;
        }
      }
    }
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;

    .chart-card {
      height: 400px;
      display: flex;
      flex-direction: column;
      
      :deep(.el-card__body) {
        flex: 1;
        padding: 10px;
      }
      
      .chart-container {
        width: 100%;
        height: 100%;
        min-height: 300px;
      }
    }

    .list-card {
      height: 400px;
      display: flex;
      flex-direction: column;
      
      :deep(.el-card__body) {
        flex: 1;
        overflow-y: auto;
      }

      .article-title {
        font-weight: 500;
        color: var(--text-color);
        &:hover {
          color: var(--primary-color);
          cursor: pointer;
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .dashboard {
    .overview-cards {
      grid-template-columns: 1fr;
    }
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
