<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })
await navigateTo('/admin/site/settings', { replace: true })
</script>
