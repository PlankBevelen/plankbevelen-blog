<template>
    <header class="header">
        <div class="header-container">
            <div class="logo-box">
                <NuxtLink to="/" class="logo-link">
                    <img src="/logo.svg" alt="Plankbevelen Blog" class="logo" />
                </NuxtLink>
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

                <!-- 用户登录区域 -->
                <div class="user-box">
                    <div class="user-avatar" @click="handleUserClick">
                        <img :src="userStore.userAvatar" :alt="userStore.isLoggedIn ? userStore.userName : ''" class="avatar-img" />
                        <span v-if="!userStore.isLoggedIn" class="login-text">登录</span>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from '~/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

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
        name: 'article',
        name_act: 'article_act',
        title: '文章',
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

const leaveNavItem = (index: number) => {
    navItems.value[index].hover = false;
}

// 处理用户头像点击
const handleUserClick = () => {
    if (userStore.isLoggedIn) {
        // 已登录，跳转到个人主页
        router.push('/profile');
    } else {
        // 未登录，跳转到登录页面
        router.push('/login');
    }
}

watch(route, () => {
    const name = route.name;
    navItems.value.forEach((item, index) => {
        item.activate = item.name === name;
    });
});

onMounted(() => {
    // 初始化用户状态
    userStore.initUserState();
    
    const name = route.name;
    navItems.value.forEach((item, index) => {
        item.activate = item.name === name;
    });
});

</script>

<style lang="less" src="~/assets/styles/components/header.less" />