<template>
  <Statistics />
</template>

<script setup lang="ts">
import Statistics from '@/components/admin/statistics.vue'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })
</script>

<style lang="less" scoped>
.admin-index {
  padding: 24px 0;
}
</style>
