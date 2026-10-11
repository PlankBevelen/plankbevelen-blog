<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })
await navigateTo('/admin/content/article', { replace: true })
</script>
