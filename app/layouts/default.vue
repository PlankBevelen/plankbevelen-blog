<template>
    <Header />
    <main id="main">
        <NuxtPage />
    </main>
    <Footer />
</template>

<script setup lang="ts">
import Header from './defaultLayout/Header.vue'
import Footer from './defaultLayout/Footer.vue'

</script>

<style lang="less">
@media (max-width: @max-content-width) {
    #main {
        padding: 0 20px;
    }
}
</style>
