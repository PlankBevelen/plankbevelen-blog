<template>
    <header class="header">
        <div class="header-container">
            <div class="logo-box">

            </div>
            <div class="nav-box">
                <div class="nav-item" 
                    v-for="(item, index) in navItems" 
                    :key="index" 
                    :class="{ active: item.activate }"
                    @click="activateNavItem(index)" 
                    @mouseenter="hoverNavItem(index)"
                    @mouseleave="leaveNavItem(index)"
                    >
                    <svg-icon :name="item.activate ? item.name_act : (item.hover ? item.name_act : item.name)" class="nav-icon"/>
                    <span :class="{ active: item.activate }">{{ item.title }}</span>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const navItems = ref([
    {
        name: 'home',
        name_act: 'home_act',
        title: '主页',
        activate: true,
        hover: false
    },
    {
        name: 'about',
        name_act: 'about_act',
        title: '说说',
        activate: false,
        hover: false
    },
    {
        name: 'category',
        name_act: 'category_act',
        title: '分类',
        activate: false,
        hover: false
    },
    {
        name: 'album',
        name_act: 'album_act',
        title: '相册',
        activate: false,
        hover: false
    },
    {
        name: 'timeline',
        name_act: 'timeline_act',
        title: '时间轴',
        activate: false,
        hover: false
    },
    {
        name: 'friend',
        name_act: 'friend_act',
        title: '友链',
        activate: false,
        hover: false
    },
    {
        name: 'message',
        name_act: 'message_act',
        title: '留言',
        activate: false,
        hover: false
    }
]);

const activateNavItem = (index) => {
    navItems.value.forEach((item, i) => {
        item.activate = i === index;
    });
    // 跳转
    router.push({ name: navItems.value[index].name });
}

const hoverNavItem = (index) => {
    navItems.value[index].hover = true;
}

const leaveNavItem = (index) => {
    navItems.value[index].hover = false;
}

watch(route, () => {
    const name = route.name;
    navItems.value.forEach((item, index) => {
        item.activate = item.name === name;
    });
});

onMounted(() => {
    const name = route.name;
    navItems.value.forEach((item, index) => {
        item.activate = item.name === name;
    });
});

</script>

<style lang="less" src="~/assets/styles/components/header.less" />