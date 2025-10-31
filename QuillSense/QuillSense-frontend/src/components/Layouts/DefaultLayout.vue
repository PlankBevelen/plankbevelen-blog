<template>
    <div class="layout">
        <header>
            <AppHeader/>
        </header>

        <main class="main-content">
            <router-view/>
        </main>

        <footer>
            <AppFooter/>
        </footer>
    </div>
</template>

<script lang="ts" setup>
import AppHeader from '@/components/Layouts/AppHeader.vue'
import AppFooter from '@/components/Layouts/AppFooter.vue'
</script>

<style lang="less">
.layout {
    min-height: 100vh;
}

.main-content {
    min-height: 100vh;
}
</style>
