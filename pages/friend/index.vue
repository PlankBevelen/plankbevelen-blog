<template>
    <TopBanner :imagePath="imagePath" :title="title" height="35vh"/>
    <div class="friend">
        <div class="container">

        </div>
    </div>
</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue';

const imagePath = '/img/topBanner/article.jpg';
const title = '友链';

</script>

<style scoped lang="less">

</style>