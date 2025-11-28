<template>
  <Dashboard />
</template>

<script setup lang="ts">
import Dashboard from '@/components/admin/dashboard.vue'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

</script>

<style lang="less" scoped>
.admin-index {
  padding: 24px 0;
}
</style>
