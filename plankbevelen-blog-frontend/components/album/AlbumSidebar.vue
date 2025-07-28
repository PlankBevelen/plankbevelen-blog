<template>
    <div class="sidebar" @mouseenter="showSidebar" @mouseleave="hideSidebar">
        <svg-icon name="options" color="black" class="sidebar-icon" />
        <div class="custom-drawer" :class="{ 'drawer-visible': drawerVisible }">
            <div class="drawer-content">
                <el-row :gutter="16">
                    <el-col :span="8" v-for="item in albumList" :key="item.id">
                        <div class="album-card">
                            <div class="album-image-container">
                                <img v-lazy="item.image" alt="album-image" class="album-image">
                            </div>
                            <div class="album-info">
                                <h4 class="album-title">{{ item.title }}</h4>
                                <p class="album-date">{{ item.updateDate }}</p>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AlbumItem } from '@/types/album'

const drawerVisible = ref(false)

const showSidebar = () => {
    drawerVisible.value = true
}

const hideSidebar = () => {
    drawerVisible.value = false
}

const albumList = ref<AlbumItem[]>([
    {
        id: 1,
        title: '自然风光',
        image: 'https://picsum.photos/seed/nature1/180/180',
        description: '自然风光是指自然界的风光、景色、植物、动植物、鸟类、鱼类、昆虫、花卉、山脉、海洋、湖泊、湖面、海岸线、森林、草原、森林、山谷、河流、湖泊、湖面、海岸线、森林、草原、森林、山谷、河流、湖泊、湖面、海岸线、森林、草原、森林、山谷、河流、湖泊、湖面、海岸线、森林、草原、森林、山谷、河流、湖泊、湖面、海岸线、森林',
        updateDate: '2022-01-01'
    },
    {
        id: 2,
        title: '城市建筑',
        image: 'https://picsum.photos/seed/city2/180/180',
        description: '',
        updateDate: '2022-01-02'
    },
    {
        id: 3,
        title: '人物肖像',
        image: 'https://picsum.photos/seed/people3/180/180',
        description: '',
        updateDate: '2022-01-03'
    },
    {
        id: 4,
        title: '美食料理',
        image: 'https://picsum.photos/seed/food4/180/180',
        description: '',
        updateDate: '2022-01-04'
    },
    {
        id: 5,
        title: '动物世界',
        image: 'https://picsum.photos/seed/animal5/180/180',
        description: '',
        updateDate: '2022-01-05'
    },
    {
        id: 6,
        title: '艺术摄影',
        image: 'https://picsum.photos/seed/art6/180/180',
        description: '',
        updateDate: '2022-01-06'
    }
])
</script>

<style scoped lang="less">
.sidebar {
    min-width: 48px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    z-index: 31000;
    
    .sidebar-icon {
        cursor: pointer;
        align-self: center;
        
        &:hover {
            transform: scale(1.1);
        }
    }
    
    .custom-drawer {
        position: absolute;
        left: 100%;
        top: 0;
        height: 100%;
        width: 0;
        overflow: hidden;
        transition: width 0.6s ease;
        box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
        background-color: #fff;
        
        &.drawer-visible {
            width: 600px;
        }
        
        .drawer-content {
            padding: 20px;
            height: 100%;
            box-sizing: border-box;

            :deep(.el-row) {
                row-gap: 20px;
            }
        }
    }
}

.album-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;
    width: max-content;
    
    &:hover {
        transform: translateY(-4px);
    }
    
    .album-image-container {
        width: 100%;
        height: 160px;
        overflow: hidden;
        
        .album-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
            
            &:hover {
                transform: scale(1.05);
            }
        }
    }
    
    .album-info {
        padding: 12px;
        
        .album-title {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            color: #303133;
        }
        
        .album-date {
            margin: 6px 0 0;
            font-size: 12px;
            color: #909399;
        }
    }
}
</style>
    