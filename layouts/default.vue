<template>
    <div class="layout">
        <!-- <NuxtLayout>
            <Header />
            <NuxtPage />
            <Footer />
        </NuxtLayout> -->
        <Header />
        <slot />
        <Footer />
    </div>
</template>

<script setup>    
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<style scoped></style>





