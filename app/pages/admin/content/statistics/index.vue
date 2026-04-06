<template>
  <AdminStatistics />
</template>

<script setup lang="ts">


definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })
</script>

<style lang="less" scoped>
.admin-index {
  padding: 24px 0;
}
</style>
