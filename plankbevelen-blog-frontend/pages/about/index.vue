<template>
    <TopBanner :imagePath="imagePath" :title="title" height="35vh"/>
    <div class="about">
        <div class="container">
            <div class="left-side">
                <div class="statistics-box">
                    <div class="box-item">
                        <span class="value">12</span>
                        <span class="name">说说</span>
                    </div>
                    <div class="line"></div>
                    <div class="box-item">
                        <span class="value">1000+</span>
                        <span class="name">照片</span>
                    </div>
                    <div class="line"></div>
                    <div class="box-item">
                        <span class="value">100+</span>
                        <span class="name">评论</span>
                    </div>
                </div>
                <div class="info-box">
                    <div class="box-header">
                        <h4>个人档</h4>
                    </div>
                    <div class="box-item">
                        <svg-icon name="about1" />
                        <span>该页面用于发行日常说说. 记录生活点滴，与大家交流心得。欢迎大家前来浏览！</span>
                    </div>
                    <div class="box-item">
                        <svg-icon name="about2" />
                        <span>浪漫至死不渝.</span>
                    </div>
                    <div class="box-item">
                        <svg-icon name="about3" />
                        <span>广东 深圳.</span>
                    </div>
                    <div class="box-item">
                        <svg-icon name="about4" />
                        <span>无业游民.</span>
                    </div>    
                </div>
            </div>
            <div class="about-list">
                <AboutCard 
                    v-for="item in paginatedAbout" 
                    :key="item.id" 
                    :item="item" 
                />
                <div class="pagination">
                    <el-pagination
                        v-model:current-page="curPage"
                        v-model:page-size="pageSize"
                        :total="totalCount"
                        :page-sizes="[5, 10, 20, 50]"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handlePageChange"
                    >
                    </el-pagination>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import TopBanner from '@/components/TopBanner.vue';
import AboutCard from '@/components/about/AboutCard.vue';
import talkService from '~/services/talkService';
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();

interface AboutItem {
    id: number;
    avatar: string;
    nickname: string;
    content: string;
    imgs: string[];
    date: string;
    views: number;
    comments: number;
    likes: number;
}

const imagePath = '/img/topBanner/about.jpg';
const title = '说说';
const about = ref<AboutItem[]>([]);

// 分页
const curPage = ref(1);
const pageSize = ref(10);
const totalCount = computed(() => {
    return about.value.length;
});
const paginatedAbout = computed(() => {
    const start = (curPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return about.value.slice(start, end);
});

// 获取所有说说内容
const fetchTalks = async () => {
    try {
        const response = await talkService.getPublishedTalks();
        console.log(response.data[0])
        about.value = response.data[0].map((item: any) => {
            return {
                ...item,
                imgs: item.images ? JSON.parse(item.images) : [],
                date: new Date(item.created_at).toLocaleDateString('zh-CN'),
                views: Math.floor(Math.random() * 100) + 1, // 临时随机数据
                comments: item.comment_count || 0,
                likes: item.like_count || 0,
            }
        });
    } catch (error) {
        console.error('获取说说失败:', error);
    }
}

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    curPage.value = 1; 
}

const handlePageChange = (val: number) => {
    curPage.value = val;
}

onMounted(() => {
    // 随机生成10条说说数据
    fetchTalks();
});
</script>

<style src="@/assets/styles/pages/about.less" lang="less" />