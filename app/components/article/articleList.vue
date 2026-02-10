<template>
    <div class="article-list">
        <div class="list" v-if="!loading">
            <ArticleDesc v-for="item in articleList" :key="item.id" :article="item" />
        </div>
        <div class="list" v-else>
            <Card v-for="item in articleList" :key="item.id">
                <el-skeleton animated >
                    <template #template>
                        <el-skeleton-item variant="h1" style="width: 60%; margin-bottom: 12px;" />
                        <div style="display:flex; gap:8px; margin-bottom: 12px;">
                            <el-skeleton-item variant="text" style="width: 80px;" />
                            <el-skeleton-item variant="text" style="width: 120px;" />
                            <el-skeleton-item variant="text" style="width: 120px;" />
                        </div>
                        <el-skeleton-item variant="text" />
                        <el-skeleton-item variant="text" />
                        <el-skeleton-item variant="text" style="width: 80%;" />
                    </template>
                </el-skeleton>
            </Card>
        </div>
        <div class="pager" v-if="!single">
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
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, defineAsyncComponent } from 'vue'
import type { Article } from '@/types/article'
import articleService from '@/services/article.service'
import Card from '@/components/cards/card.vue'
const ArticleDesc = defineAsyncComponent({
    loader: () => import('./articleDesc.vue'),
    delay: 100
})

const props = defineProps(
    {
        single: {
            type: Boolean,
            default: false
        },
        articleList: {
            type: Array as () => Article[],
            default: () => []
        },
        q: {
            type: String,
            default: ''
        }
    }
)

const single = props.single === true
const articleList = ref<Article[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const loading = ref(false)
let qTimer: any = null

const loadData = async () => {
    loading.value = true
    try {
        const res = await articleService.getArticles(page.value, limit.value, props.q || undefined)
        if (res.status === 200 && res.data.status === 200) {
            articleList.value = res.data.data || []
            total.value = Number(res.data.total || 0)
        }
    } finally {
        loading.value = false
    }
}

const onPageSizeChange = async (val: number) => { limit.value = val; page.value = 1; await loadData() }
const onPageChange = async (val: number) => { page.value = val; await loadData() }

onMounted(async () => {
    if(!props.articleList || props.articleList.length === 0) {
        await loadData()
    } else {
        articleList.value = props.articleList
        total.value = props.articleList.length
    }
})

watch(() => props.q, async () => { 
    page.value = 1; 
    if (qTimer) clearTimeout(qTimer)
    qTimer = setTimeout(async () => { await loadData() }, 250)
})
</script>

<style scoped lang="less">
.article-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 40px;
}
.list { 
    display: flex; 
    flex-direction: column; 
    gap: 20px; 
}
.pager { display: flex; justify-content: flex-end; }
</style>
