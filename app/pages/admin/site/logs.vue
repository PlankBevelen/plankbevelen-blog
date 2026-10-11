<template>
  <div class="space-y-4">
    <div class="page-intro">
      <h2 class="page-title">访问</h2>
      <p class="page-desc">
        独立访客按同浏览器第一方 Cookie 去重；清缓存、无痕模式或换浏览器会算作新访客。IP 仅作辅助参考。
      </p>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <BaseCard>
      <template #header>
        <span>热门页面</span>
      </template>
      <div v-if="summary.topPaths.length" class="top-paths">
        <div v-for="item in summary.topPaths" :key="item.path" class="top-path-row">
          <span>{{ item.path }}</span>
          <strong>{{ item.count }}</strong>
        </div>
      </div>
      <el-empty v-else description="暂无访问路径数据" :image-size="72" />
    </BaseCard>

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
              placeholder="搜索路径或 IP"
              clearable
              class="!w-[240px]"
            />
            <el-select v-model="filters.days" class="!w-[140px]">
              <el-option :value="1" label="近 1 天" />
              <el-option :value="7" label="近 7 天" />
              <el-option :value="30" label="近 30 天" />
              <el-option :value="90" label="近 90 天" />
            </el-select>
            <el-button @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </div>
          <template #actions>
            <el-button type="primary" @click="fetchLogs">刷新</el-button>
          </template>
        </BaseQueryBar>
      </template>

      <el-table-column label="路径" min-width="260">
        <template #default="{ row }">
          <div class="log-meta">
            <strong>{{ row.path }}</strong>
            <span v-if="row.fullPath !== row.path">{{ row.fullPath }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="访客" width="200">
        <template #default="{ row }">
          <div class="log-meta">
            <strong>{{ shortVisitorId(row.visitorId) }}</strong>
            <span>{{ row.ip }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="环境" width="160">
        <template #default="{ row }">
          <span>{{ row.browser }} · {{ deviceLabelMap[row.deviceType] || row.deviceType }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          {{ row.statusCode }}
        </template>
      </el-table-column>

      <el-table-column label="时间" width="180">
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
import siteService from '@/services/site'
import type { VisitLogItem, VisitLogSummary } from '@/types/data/site'
import { formatDateTime } from '@/utils/format'
import { toApiError } from '@/utils/api-error'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const defaultFilters = {
  keyword: '',
  deviceType: 'all',
  days: 7
}

const deviceLabelMap: Record<string, string> = {
  desktop: '桌面',
  mobile: '移动',
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
    desc: `近 ${filters.value.days} 天`
  },
  {
    key: 'uv',
    label: '独立访客',
    value: summary.value.uniqueVisitors,
    desc: '同浏览器 Cookie 去重'
  },
  {
    key: 'today',
    label: '今日访问',
    value: summary.value.todayVisits,
    desc: summary.value.latestVisitedAt
      ? `最近：${formatDateTime(summary.value.latestVisitedAt)}`
      : '暂无记录'
  }
])

function shortVisitorId(visitorId?: string) {
  if (!visitorId) return '旧记录'
  return visitorId.slice(0, 8)
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const data = await siteService.getVisitLogs({
      ...filters.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })
    rows.value = data.list || []
    summary.value = data.summary || summary.value
    pagination.value = {
      page: data.pagination?.page || pagination.value.page,
      pageSize: data.pagination?.pageSize || pagination.value.pageSize,
      total: data.pagination?.total || 0
    }
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '获取访问日志失败')
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
  max-width: 48rem;
  line-height: 1.6;
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
  font-size: @font-size-sm;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-color);
  }

  strong {
    color: var(--primary-color);
  }
}

.log-meta {
  display: flex;
  flex-direction: column;
  gap: @space-2xs;

  strong {
    color: var(--text-color);
    word-break: break-all;
  }

  span {
    color: var(--secondary-color);
    font-size: @font-size-xs;
    line-height: 1.5;
    word-break: break-all;
  }
}
</style>
