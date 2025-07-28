<template>
    <TopBanner :imagePath="imagePath" :title="title" height="35vh"/>
    <div class="album">
        <div class="container">
            <AlbumSidebar />
            <div class="album-content">
                <div class="album-controls">
                    <el-input v-model="searchText" placeholder="搜索照片" > 
                        <template #suffix>
                            <el-button type="primary">
                                <el-icon><Search /></el-icon>
                            </el-button>
                        </template>
                    </el-input>
                    <el-select v-model="columnSelected" placeholder="选择显示列数">
                        <el-option v-for="item in collumSelectValues" :label="item" :value="item" />
                    </el-select>
                </div>
                <div class="album-grid">
                    <el-row :gutter="20" >
                        <el-col :span="columnSpan" v-for="item in curAlbumPictures" :key="item.id" class="album-item">
                            <el-image :src="item.image" fit="contain" lazy @click="handleImageClick(item.image)">

                            </el-image>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </div>
    </div>

    <el-image-viewer 
        v-if="viewVisible"
        :url = "[currentImageUrl]"
        @close = "viewVisible = false"
    />
</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue';
import AlbumSidebar from '@/components/album/AlbumSidebar.vue';
import type { AlbumItem, AlbumListItem } from '@/types/album';
import { Search } from '@element-plus/icons-vue';
import {ref, onMounted} from 'vue';

const imagePath = '/img/topBanner/article.jpg';
const title = '相册';

const collumSelectValues = ['4', '8', '12', '24']
const columnSelected = ref(collumSelectValues[0])
const columnSpan = computed(() => {
    return 24 / parseInt(columnSelected.value)
})

const viewVisible = ref(false)
const currentImageUrl = ref('')
const handleImageClick = (url: string) => {
    currentImageUrl.value = url
    viewVisible.value = true
}

const searchText = ref('')

const curAlbum = ref({
        id: 1,
        title: '自然风光',
        image: 'https://picsum.photos/seed/art6/180/180',
        description: '自然风光，是指自然界的各种景观、自然现象及其变化，是人类观察自然界的一种方式。',
        updateDate: '2022-01-01'
    })
const curAlbumPictures = ref<AlbumListItem[]>([])

onMounted(() => {
    for(let i = 0 ; i < 30; i++) {
        curAlbumPictures.value.push({
            id: i,
            parent: 1,
            image: `https://picsum.photos/seed/art${i}/200/200`,
            updateDate: '2022-01-01'
        })
    }

});

</script>

<style scoped lang="less" src="@/assets/styles/pages/album.less" />