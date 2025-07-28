<template>
    <TopBanner :imagePath="imagePath" :title="title">
        <TypeWriter :textArr="textArr" class="typewriter"/>
    </TopBanner>
    <div class="home">
        <div class="container">
            <!-- 帖子 -->
            <div class="left-side">
                <!-- 文章列表（只显示置顶） -->
                <div class="article-list">
                    
                </div>
            </div>
            <!-- 侧边栏 -->
            <div class="right-side">
                <!-- 关于作者 -->
                <div class="profile card">
                    <div class="head">
                        <img class="avatar" src="/img/avatar/avatar.jpg" alt="profile">
                        <h3 class="nickname">Plankbevelen</h3>
                    </div>
                    <div class="decription">
                        <p>我想吃KFC、汉堡王、达美乐、麦当劳！我还想睡懒觉！我还想打游戏！</p>
                    </div>
                    <div class="statistics">
                        <div class="item">
                            <span class="title">文章</span>
                            <span class="value">10</span>
                        </div>
                        <div class="item">
                            <span class="title">分类</span>
                            <span class="value">10</span>
                        </div>
                        <div class="item">
                            <span class="title">标签</span>
                            <span class="value">10</span>
                        </div>
                    </div>
                    <div class="social" @click="goToGithub">
                        <svg-icon name="github" size="1.5em"/>
                        <span>My Github</span>
                    </div>
                </div>
                <!-- 公告 -->
                <div class="annoucement card">
                    <div class="title">
                        <svg-icon name="annoucement" size="2em"/>
                        <span>公告</span>
                    </div>
                    <div class="content">
                        <p>Welcome to the blog of PlankBevelen. </p>
                        <p>If you have any better suggestions, please let me know through the contact information below. </p>
                        <p>Meanwhile, I will thank you for your contribution to this blog. </p>
                    </div>
                </div>
                <!-- 联系我 -->
                <div class="contact card">
                    <div class="title">
                        <svg-icon name="contact" size="1.65em"/>
                        <span>交流</span>
                    </div>
                    <div class="content">
                        <span>QQ: 3585135040</span>
                        <span>WX: PlankBevelen</span>
                        <div class="er-codes">
                            <svg-icon name="qq" size="2.4em"/>
                            <svg-icon name="wx" size="1.8em"/>
                            <svg-icon name="group" size="1.7em"/>
                        </div>
                    </div>
                </div>
                <!-- 网站信息 -->
                <div class="information card">
                    <div class="title">
                        <svg-icon name="information" size="1.65em"/>
                        <span>网站咨讯</span>
                    </div>
                    <div class="content">
                        <div class="item">文章数目：<span>10</span></div>
                        <div class="item">运行时间：<span>10 天</span></div>
                        <div class="item">博客访问次数：<span>10</span></div>
                    </div>
                </div>
            </div>
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

const goToGithub = () => {
    window.open('https://github.com/plankbevelen');
}
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