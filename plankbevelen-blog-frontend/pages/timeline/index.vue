<template>
    <TopBanner :imagePath="imagePath" :title="title" height="35vh"/>
    <div class="timeline">
        <div class="container">

        </div>
    </div>
</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue';

const imagePath = '/img/topBanner/about.jpg';
const title = '时间轴';

</script>

<style scoped lang="less">

</style>