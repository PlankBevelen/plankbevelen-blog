<template>
    <TopBanner :imagePath="imagePath" :title="title" height="35vh"/>
    <div class="about">
        <div class="container">
            <div class="left-side">
                <div class="statistics-box">
                    <div class="box-item">
                        <span class="value">{{ totalCount }}</span>
                        <span class="name">说说</span>
                    </div>
                    <div class="line"></div>
                    <div class="box-item">
                        <span class="value">{{ totalPhotos }}</span>
                        <span class="name">照片</span>
                    </div>
                    <div class="line"></div>
                    <div class="box-item">
                        <span class="value">{{ totalComments }}</span>
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
            <div class="talk-list">
                <TalkCard 
                    v-for="item in paginatedTalks" 
                    :key="item.id" 
                    :item="item" 
                />
                <div class="pagination">
                    <el-pagination
                        v-model:current-page="curPage"
                        :page-size="pageSize"
                        :total="totalCount"
                        layout="total, prev, pager, next, jumper"
                        @current-change="handlePageChange"
                    >
                    </el-pagination>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import TopBanner from '@/components/TopBanner.vue';
import TalkCard from '~/components/about/TalkCard.vue';
import talkService from '~/services/talkService';
import { useUserStore } from '~/stores/user';
import { useLikeStore } from '~/stores/like';
import { useCommentStore } from '~/stores/comment';
import { smartFormatTime } from '~/utils/timeUtils';
import type { Talk } from '~/types/talk';

const userStore = useUserStore();
const likeStore = useLikeStore();
const commentStore = useCommentStore();

const imagePath = '/img/topBanner/about.jpg';
const title = '说说';
const talks = ref<Talk[]>([]);

// 分页
const curPage = ref(1);
const pageSize = ref(10);
const totalCount = computed(() => {
    return talks.value.length;
});

// 统计数据
const totalPhotos = computed(() => {
    return talks.value.reduce((total, talk) => {
        return total + (talk.images ? talk.images.length : 0);
    }, 0);
});

const totalComments = computed(() => {
    return talks.value.reduce((total, talk) => {
        return total + (talk.comment_count || 0);
    }, 0);
});

// 当页说说
const paginatedTalks = computed(() => {
    const start = (curPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return talks.value.slice(start, end);
});

// 获取当页说说的点赞状态
const fetchCurrentPageLikeStatus = async () => {
    if (paginatedTalks.value.length > 0) {
        const talkIds = paginatedTalks.value.map(talk => talk.id);
        await likeStore.fetchBatchLikeStatus(talkIds);
    }
};

// 初始化当页说说的评论数量
const fetchCurrentPageCommentCounts = async () => {
    paginatedTalks.value.forEach(talk => {
        commentStore.setCommentState(talk.id, { count: talk.comment_count || 0 });
    });
};

// 获取所有说说内容
const fetchTalks = async () => {
    try {
        const res = await talkService.getPublishedTalks();
        talks.value = res;
        // 获取第一页的点赞状态
        await fetchCurrentPageLikeStatus();
        // 初始化第一页的评论数量
        await fetchCurrentPageCommentCounts();
    } catch (error) {
        console.error('获取说说失败:', error);
    }
}

const handlePageChange = (val: number) => {
    curPage.value = val;
    // 获取新页面的点赞状态
    fetchCurrentPageLikeStatus();
    // 初始化新页面的评论数量
    fetchCurrentPageCommentCounts();
}

onMounted(() => {
    // 随机生成10条说说数据
    fetchTalks();
});
</script>

<style src="@/assets/styles/pages/about.less" lang="less" />