<template>
    <div class="home">
        <div class="container">
            <ThreeColumnLayout>
                <template #left class="left">
                    <BloggerCard />
                    <RecordLinkCard />
                </template>
                <template #middle>
                    <div class="middle">
                        <h2>Middle</h2>
                    </div>
                </template>
                <template #right>
                    <div class="right">
                        <h2>Right</h2>
                    </div>
                </template>
            </ThreeColumnLayout>
        </div>        
    </div>
</template>

<script setup lang="ts">
import ThreeColumnLayout from '@/components/layouts/ThreeColumnLayout.vue'
import BloggerCard from '@/components/cards/blogger.vue'
import RecordLinkCard from '@/components/cards/recordLink.vue'

</script>

<style lang="less" scoped>
.home {
    min-height: 100vh;
    height: 100vh;
    padding-top: @header-height;
    .container {
        height: 100%;
        padding: 40px 0;
    }
}
</style>