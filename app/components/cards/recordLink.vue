<!-- 推荐网站链接 -->
<template>
    <Card type="record-link">
        <template #header>
            {{ $t('cards.recordLink.title') }}
        </template>
        <ul class="links">
            <li v-for="item in recordLink" :key="item.link" class="link-item">
                <a :href="item.link" target="_blank" rel="noopener noreferrer" class="link">
                    <span class="title">{{ item.title }}</span>
                    <span class="target">{{ item.target }}</span>
                </a>                    
            </li>
        </ul>
    </Card>
</template>

<script setup lang="ts">
import Card from './card.vue'
import { ref } from 'vue'

const recordLink = ref([
    { title: 'Nuxt', target: 'nuxt.com.cn', link: 'https://nuxt.com.cn/' },
    { title: 'Figma', target: 'figma.com', link: 'https://figma.com/' },
    { title: 'Aliyun FC', target: 'aliyun.com', link: 'https://www.aliyun.com/product/fc' },
    { title: 'Apifox', target: 'apifox.com', link: 'https://www.apifox.com/' },
    { title: 'MDN WebRTC', target: 'developer.mozilla.org', link: 'https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API' },
    { title: 'GSAP', target: 'gsap.com', link: 'https://gsap.com/' },
    { title: 'Three.js', target: 'threejs.org', link: 'https://threejs.org/' },
])

</script>

<style lang="less" scoped>
.record-link {
    .links {
        display: flex;
        flex-direction: column;
        gap: @base-gap;
    }
    .link-item {
        .link {
            display: flex;
            align-items: center;
            justify-content: space-between;            
            text-decoration: none;
            border-radius: @small-border-radius;
            padding: 6px 8px;
            .title {
                color: var(--primary-color);
                font-size: 14px;
            }
            .target {
                color: var(--tertiary-color);
                background-color: var(--mute-bg-color);
                padding: 4px 8px;
                border-radius: @small-border-radius;
                font-size: 11px;
            }
            &:hover {
                background-color: var(--shallow-hover-bg-color);
            }
        }    
    }
}
</style>
