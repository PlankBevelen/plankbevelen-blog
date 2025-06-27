<template>
    <TopBanner :imagePath="imagePath" :title="title">
        <TypeWriter :textArr="textArr" class="typewriter"/>
    </TopBanner>
    <div class="home">
        <div class="content">
            
        </div>
    </div>
</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue';
import TypeWriter from '@/components/TypeWriter.vue';

const imagePath = '/img/topBanner/home.jpg';
const title = 'Welcome to Plankbevelen Blog';
const textArr = [
    "傲慢至死.",
    "Arrogant Until Death."
]

</script>

<style scoped lang="less">
.typewriter {
    position: absolute;
    z-index: 100;
    left: 50%;
    top: 62%;
    transform: translate(-50%, -50%);
    font-size: 2.5rem;
}
</style>

<style lang="less" src="@/assets/styles/pages/home.less"/>