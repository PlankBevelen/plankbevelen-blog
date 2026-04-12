<template>
  <div class="space-y-6">
    <section class="logs-hero">
      <div>
        <p class="logs-kicker">Access Log Center</p>
        <h1 class="logs-title">访问日志</h1>
        <p class="logs-desc">
          公开页面的 HTML 访问会由服务端自动记录，后台可以按时间范围、关键词和设备类型查看访问轨迹。
        </p>
      </div>
      <el-button :loading="loading" @click="fetchLogs">刷新日志</el-button>
    </section>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <div class="insight-grid">
      <BaseCard>
        <template #header>
          <span>热门页面</span>
        </template>
        <div v-if="summary.topPaths.length" class="insight-list">
          <div v-for="item in summary.topPaths" :key="item.path" class="insight-item">
            <span>{{ item.path }}</span>
            <strong>{{ item.count }}</strong>
          </div>
        </div>
        <el-empty v-else description="暂无访问路径数据" />
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>设备分布</span>
        </template>
        <div v-if="summary.deviceDistribution.length" class="device-list">
          <el-tag
            v-for="item in summary.deviceDistribution"
            :key="`${item.deviceType}-${item.count}`"
            effect="plain"
            round
          >
            {{ deviceLabelMap[item.deviceType] || item.deviceType }} / {{ item.count }}
          </el-tag>
        </div>
        <el-empty v-else description="暂无设备分布数据" />
      </BaseCard>
    </div>

    <BaseDataTable
      :data="rows"
      :loading="loading"
      :total="pagination.total"
      :page="pagination.page"
      :page-size="pagination.pageSize"
      row-key="requestId"
      @update:page="onPageChange"
      @update:pageSize="onPageSizeChange"
    >
      <template #header>
        <BaseQueryBar>
          <div class="flex flex-wrap items-center gap-2">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索路径、IP、浏览器或来源"
              clearable
              class="w-[280px]"
            />
            <el-select v-model="filters.deviceType" class="w-[160px]">
              <el-option label="全部设备" value="all" />
              <el-option label="桌面端" value="desktop" />
              <el-option label="移动端" value="mobile" />
              <el-option label="平板" value="tablet" />
              <el-option label="爬虫" value="bot" />
            </el-select>
            <el-select v-model="filters.days" class="w-[140px]">
              <el-option :value="1" label="近 1 天" />
              <el-option :value="7" label="近 7 天" />
              <el-option :value="30" label="近 30 天" />
              <el-option :value="90" label="近 90 天" />
            </el-select>
            <el-button @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </div>
          <template #actions>
            <span class="table-tip">当前只记录公开页面访问，不采集后台和静态资源请求</span>
          </template>
        </BaseQueryBar>
      </template>

      <el-table-column label="访问路径" min-width="280">
        <template #default="{ row }">
          <div class="log-path">
            <strong>{{ row.path }}</strong>
            <span>{{ row.fullPath }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="访客" width="170">
        <template #default="{ row }">
          <div class="log-meta">
            <strong>{{ row.ip }}</strong>
            <span>{{ row.method }} / {{ row.statusCode }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="设备环境" min-width="220">
        <template #default="{ row }">
          <div class="log-meta">
            <div class="log-tags">
              <el-tag :type="deviceTagType(row.deviceType)" effect="plain" round>
                {{ deviceLabelMap[row.deviceType] || row.deviceType }}
              </el-tag>
              <el-tag :type="statusTagType(row.statusCode)" effect="plain" round>
                {{ row.browser }}
              </el-tag>
            </div>
            <span>{{ row.os }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="来源" min-width="240">
        <template #default="{ row }">
          <div class="log-meta">
            <strong>{{ row.referer || '直接访问' }}</strong>
            <span class="line-clamp-2">{{ row.userAgent }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="耗时" width="110" align="center">
        <template #default="{ row }">
          {{ row.durationMs }} ms
        </template>
      </el-table-column>

      <el-table-column label="访问时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.visitedAt) }}
        </template>
      </el-table-column>
    </BaseDataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import siteService from '@/services/site.service'
import type { VisitLogItem, VisitLogSummary } from '@/types/site'
import { formatDateTime } from '@/utils/format'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const defaultFilters = {
  keyword: '',
  deviceType: 'all',
  days: 7
}

const deviceLabelMap: Record<string, string> = {
  desktop: '桌面端',
  mobile: '移动端',
  tablet: '平板',
  bot: '爬虫',
  unknown: '未知'
}

const filters = ref({ ...defaultFilters })
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})
const loading = ref(false)
const rows = ref<VisitLogItem[]>([])
const summary = ref<VisitLogSummary>({
  totalVisits: 0,
  uniqueVisitors: 0,
  averageDurationMs: 0,
  todayVisits: 0,
  latestVisitedAt: null,
  topPaths: [],
  deviceDistribution: []
})

const summaryCards = computed(() => [
  {
    key: 'pv',
    label: '访问次数',
    value: summary.value.totalVisits,
    desc: `近 ${filters.value.days} 天记录到的页面访问`
  },
  {
    key: 'uv',
    label: '独立访客',
    value: summary.value.uniqueVisitors,
    desc: '按 IP 粗略去重后的访客数'
  },
  {
    key: 'today',
    label: '今日访问',
    value: summary.value.todayVisits,
    desc: '从今天 00:00 到现在的访问次数'
  },
  {
    key: 'duration',
    label: '平均耗时',
    value: `${summary.value.averageDurationMs} ms`,
    desc: summary.value.latestVisitedAt
      ? `最近一条：${formatDateTime(summary.value.latestVisitedAt)}`
      : '还没有产生访问记录'
  }
])

const deviceTagType = (deviceType: string) => {
  if (deviceType === 'mobile') return 'success'
  if (deviceType === 'tablet') return 'warning'
  if (deviceType === 'bot') return 'danger'
  return 'info'
}

const statusTagType = (statusCode: number) => {
  if (statusCode >= 500) return 'danger'
  if (statusCode >= 400) return 'warning'
  return 'primary'
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res: any = await siteService.getVisitLogs({
      ...filters.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })

    if (res?.status === 200 && res.data) {
      rows.value = res.data.list || []
      summary.value = res.data.summary || summary.value
      pagination.value = {
        page: res.data.pagination?.page || pagination.value.page,
        pageSize: res.data.pagination?.pageSize || pagination.value.pageSize,
        total: res.data.pagination?.total || 0
      }
      return
    }

    ElMessage.error(res?.msg || '获取访问日志失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '获取访问日志失败')
  } finally {
    loading.value = false
  }
}

const onSearch = async () => {
  pagination.value.page = 1
  await fetchLogs()
}

const onReset = async () => {
  filters.value = { ...defaultFilters }
  pagination.value.page = 1
  pagination.value.pageSize = 20
  await fetchLogs()
}

const onPageChange = async (page: number) => {
  pagination.value.page = page
  await fetchLogs()
}

const onPageSizeChange = async (pageSize: number) => {
  pagination.value.page = 1
  pagination.value.pageSize = pageSize
  await fetchLogs()
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped lang="less">
.logs-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 24px;
  border: 1px solid rgba(29, 78, 216, 0.14);
  background:
    radial-gradient(circle at top right, rgba(29, 78, 216, 0.14), transparent 28%),
    linear-gradient(140deg, var(--card-color), color-mix(in srgb, var(--card-color) 88%, #f1f5ff));
}

.logs-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.logs-title {
  margin: 0;
  font-size: 30px;
  color: var(--text-color);
}

.logs-desc {
  margin: 12px 0 0;
  max-width: 680px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.insight-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--card-color) 76%, #f5f7fb);
  border: 1px solid var(--border-color);

  span {
    color: var(--secondary-color);
    word-break: break-all;
  }

  strong {
    color: var(--text-color);
  }
}

.device-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.table-tip {
  font-size: 12px;
  color: var(--tertiary-color);
}

.log-path,
.log-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: var(--text-color);
    word-break: break-all;
  }

  span {
    color: var(--secondary-color);
    font-size: 12px;
    line-height: 1.6;
    word-break: break-all;
  }
}

.log-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 960px) {
  .logs-hero,
  .insight-grid {
    grid-template-columns: 1fr;
  }

  .logs-hero {
    flex-direction: column;
  }
}
</style>
