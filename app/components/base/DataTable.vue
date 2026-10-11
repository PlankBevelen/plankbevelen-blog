<template>
  <AdminPanel :flush="true" class="base-data-table">
    <div v-if="$slots.header" class="base-data-table__toolbar">
      <slot name="header" />
    </div>
    <el-table
      v-loading="loading"
      :data="data"
      :row-key="rowKey"
      style="width: 100%"
      :empty-text="emptyText"
    >
      <slot />
    </el-table>
    <div v-if="showPagination" class="base-data-table__pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        @current-change="onPage"
        @size-change="onPageSize"
      />
    </div>
  </AdminPanel>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    data: unknown[]
    loading?: boolean
    total?: number
    page?: number
    pageSize?: number
    rowKey?: string | ((row: unknown) => string)
    emptyText?: string
    pageSizes?: number[]
    hidePagination?: boolean
  }>(),
  {
    loading: false,
    total: 0,
    page: 1,
    pageSize: 20,
    emptyText: '暂无数据',
    pageSizes: () => [10, 20, 50],
    hidePagination: false
  }
)

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
}>()

const showPagination = computed(
  () => !props.hidePagination && (props.total > 0 || props.data.length > 0)
)

const onPage = (value: number) => emit('update:page', value)
const onPageSize = (value: number) => emit('update:pageSize', value)
</script>

<style scoped lang="less">
.base-data-table__toolbar {
  padding: @space-lg @space-2xl;
  border-bottom: 1px solid var(--border-color);
}

.base-data-table__pagination {
  display: flex;
  justify-content: flex-end;
  padding: @space-lg @space-2xl;
  border-top: 1px solid var(--border-color);
}
</style>
