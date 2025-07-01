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

// 随机生成说说数据
const generateMockData = (count: number): AboutItem[] => {
    const result: AboutItem[] = [];
    const nicknames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
    const contents = [
        '今天天气真好，适合出去走走！',
        '分享一张刚拍的照片，感觉还不错～',
        '终于看完了这本期待已久的书，收获满满！',
        '周末和朋友一起去爬山，累并快乐着～',
        '新学了一道菜，味道还不错，分享给大家！',
        '这个电影真的太好看了，强烈推荐！',
        '最近在学习Vue3，感觉越来越有意思了～',
        '今天收到了一份特别的礼物，很开心！'
    ];
    
    for (let i = 0; i < count; i++) {
        const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
        const content = contents[Math.floor(Math.random() * contents.length)];
        
        // 随机生成0-3张图片
        const imgCount = Math.floor(Math.random() * 4);
        const imgs: string[] = [];
        for (let j = 0; j < imgCount; j++) {
            imgs.push(`https://picsum.photos/400/300?random=${i * 10 + j}`);
        }
        
        // 生成随机日期（最近30天内）
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const formattedDate = date.toLocaleDateString() + ' ' + 
                            date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
        
        result.push({
            id: i + 1,
            avatar: '/img/avatar/avatar.jpg',
            nickname,
            content,
            imgs,
            date: formattedDate,
            views: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100),
            likes: Math.floor(Math.random() * 500)
        });
    }
    
    return result;
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
    about.value = generateMockData(30);
});
</script>

<style src="@/assets/styles/pages/about.less" lang="less" />