<template>
    <TopBanner :imagePath="imagePath" :title="title" height="35vh"/>
    <div class="about">
        <div class="container">
            <div class="tools-box">
                
            </div>

            <div class="about-item" v-for="(item, index) in about" :key="index">
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue';

const imagePath = '/img/topBanner/about.jpg';
const title = '说说';

const about = [
    { id: '', avatar: '', nickname: '', content: '' , imgs: [ ], date: '', views: 0 , comments: 0 , likes: 0 }
]

</script>

<style scoped>

</style>