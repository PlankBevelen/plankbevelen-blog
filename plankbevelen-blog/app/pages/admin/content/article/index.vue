<template>
    <div class="article container">
        <div class="article-header">
            <div class="search">
                <el-input placeholder="请输入文章标题、分类、标签" v-model="searchText" clearable @keyup.enter="onSearch"></el-input>                
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
                        <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="display:flex; justify-content:flex-end; margin-top: 16px;">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                :current-page="page"
                :page-size="limit"
                :page-sizes="[10, 20, 50]"
                @size-change="onPageSizeChange"
                @current-change="onPageChange"
              />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

import { ref, computed, onMounted, watch } from 'vue'
import type { Article } from '@/types/article'
import type { Category } from '@/types/category'
import articleService from '@/services/article.service'
import categoryService from '@/services/category.service'
import { useRoute } from 'vue-router'
import appCache from '@/utils/cache'
import { formatDateTime } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import tagService from '@/services/tag.service'
const route = useRoute()

const searchText = ref('')
const articleList = ref<Article[]>([])
const categoryList = ref<Category[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const handleEdit = (mode: string, id?: string) => {
    navigateTo({ path: '/admin/content/article/edit', query: { mode, id } })
}

const getArticleList = async () => {
  try {
    const res = await articleService.getArticles(page.value, limit.value, (searchText.value || '').trim())
    if( res.status === 200 && res.data.status === 200 ) {
        const list: Article[] = (res.data.data || []).map((i: any) => ({
          ...i,
          createTime: formatDateTime(i.createTime),
          updateTime: formatDateTime(i.updateTime),
        }))
        articleList.value = list
        total.value = Number(res.data.total || 0)
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

onMounted(async () => {
    try {
        if (!appCache.getCategories()) {
            const res = await categoryService.getCategories()
            if ( res.status === 200 && res.data.status === 200) {
                categoryList.value = res.data.data || []
                appCache.setCategories(categoryList.value)
            } 
        } else {
            categoryList.value = appCache.getCategories() || []
        }
    } catch (error) {
        console.error('获取文章列表失败:', error)
    }
    await getArticleList()
})

const onPageSizeChange = async (val: number) => { limit.value = val; page.value = 1; await getArticleList() }
const onPageChange = async (val: number) => { page.value = val; await getArticleList() }
const onSearch = async () => { page.value = 1; await getArticleList() }

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该文章吗？', '提示', { type: 'warning' })
    // 获取文章标签以便同步更新标签表
    const detail = await articleService.getArticle(id)
    const removeTags: string[] = (detail.status === 200 && detail.data.status === 200) ? (detail.data.data?.tags || []) : []
    const res = await articleService.deleteArticle(id)
    if (res.status === 200 && res.data.status === 200) {
      if (removeTags.length) {
        await tagService.syncTags([], removeTags)
      }
      appCache.removeCategories()
      ElMessage.success('删除成功')
      await getArticleList()
    }
  } catch (error: any) {
    ElMessage.error(error?.msg || '删除失败')
  }
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
