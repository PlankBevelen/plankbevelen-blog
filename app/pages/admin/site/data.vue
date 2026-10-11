<script setup lang="ts">
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })
await navigateTo('/admin', { replace: true })
</script>
