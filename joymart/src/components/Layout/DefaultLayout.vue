<template>
    <div class="layout">
        <header>
            <AppHeader />
        </header>
        <main class="container">
            <router-view/>
        </main>
        <footer>
            <AppFooter />
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/Layout/AppHeader.vue'
import AppFooter from '@/components/Layout/AppFooter.vue'

</script>

<style lang="less" scoped>
header {
    width: 100%;
    background: var(--background-color);
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(15px);
}
</style>
