<template>
  <BaseCard>
    <template #header>
      <slot name="header"></slot>
    </template>

    <div class="flex min-h-0 flex-1 flex-col">
      <el-table
        :data="data"
        :border="border"
        :stripe="stripe"
        style="width: 100%"
        v-loading="loading"
        :row-key="rowKey"
        @row-click="onRowClick"
      >
        <slot></slot>
        <template #empty>
          <slot name="empty">
            <el-empty description="暂无数据" />
          </slot>
        </template>
      </el-table>

      <div
        v-if="showPagination"
        class="mt-auto flex items-center justify-end border-t border-border px-4 py-3"
      >
        <el-pagination
          background
          :layout="paginationLayout"
          :total="total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="pageSizes"
          @size-change="onPageSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
type PageSize = number

withDefaults(
  defineProps<{
    data: any[]
    loading?: boolean
    showPagination?: boolean
    total?: number
    page?: number
    pageSize?: PageSize
    pageSizes?: PageSize[]
    paginationLayout?: string
    rowKey?: string | ((row: any) => string)
    stripe?: boolean
    border?: boolean
  }>(),
  {
    loading: false,
    showPagination: true,
    total: 0,
    page: 1,
    pageSize: 10,
    pageSizes: () => [10, 20, 50],
    paginationLayout: 'total, sizes, prev, pager, next, jumper',
    rowKey: 'id',
    stripe: false,
    border: false
  }
)

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'row-click', row: any): void
}>()

const onPageSizeChange = (value: number) => {
  emit('update:pageSize', value)
}

const onPageChange = (value: number) => {
  emit('update:page', value)
}

const onRowClick = (row: any) => {
  emit('row-click', row)
}
</script>
