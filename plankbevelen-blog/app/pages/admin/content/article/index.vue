<template>
    <div class="article container">
        <div class="article-header">
            <div class="search">
                <el-input placeholder="请输入文章标题、分类、标签" v-model="searchText" clearable></el-input>                
            </div>
            <div class="button-group">
                <el-button type="primary" @click="handleEdit('add')">新增文章</el-button>
            </div>
        </div>
        <div class="article-content">
            <el-table :data="articleList" style="width: 100%">
                <el-table-column prop="title" label="文章标题" ></el-table-column>
                <el-table-column prop="category" label="分类" width="200"></el-table-column>
                <el-table-column prop="tags" label="标签" width="200"></el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
                <el-table-column prop="updateTime" label="更新时间" width="160"></el-table-column>
                <el-table-column label="操作" width="200" class-name="operation-column">
                    <template #default="scope">
                        <el-button type="primary" size="mini" @click="handleEdit('update', scope.row.id)">编辑</el-button>
                        <el-button type="danger" size="mini">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const searchText = ref('')
const articleList = ref([
    {
        id: 'a1',
        title: '文章标题1',
        category: '分类1',
        tags: '标签1, 标签2',
        createTime: '2023-01-01 12:00',
        updateTime: '2023-01-01 12:00'
    },
    {
        id: 'a2',
        title: '文章标题2',
        category: '分类2',
        tags: '标签3, 标签4',
        createTime: '2023-01-02 12:00',
        updateTime: '2023-01-02 12:00'
    }
])

const handleEdit = (mode: string, id?: string) => {
    navigateTo({ path: '/admin/content/article/edit', query: { mode, id } })
}

</script>

<style scoped lang="less">
.article {
    height: 100%;
    .article-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
}
</style>
