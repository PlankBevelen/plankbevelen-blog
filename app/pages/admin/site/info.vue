<template>
  <div class="space-y-6">
    <section class="site-hero">
      <div>
        <p class="site-kicker">Website Profile</p>
        <h1 class="site-title">网站信息</h1>
        <p class="site-desc">
          这里汇总站点基础配置、内容规模和 SEO 状态，方便统一查看当前博客的对外信息。
        </p>
      </div>
      <el-button :loading="loading" @click="fetchInfo">刷新信息</el-button>
    </section>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.key">
        <p class="text-xs text-mute">{{ card.label }}</p>
        <div class="mt-2 text-h1 font-semibold text-text">{{ card.value }}</div>
        <div class="mt-1 text-xs text-mute">{{ card.desc }}</div>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <BaseCard>
        <template #header>
          <span>站点基础信息</span>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="站点名称">{{ info.siteName }}</el-descriptions-item>
          <el-descriptions-item label="站点地址">{{ info.siteUrl }}</el-descriptions-item>
          <el-descriptions-item label="站点作者">{{ info.siteAuthor }}</el-descriptions-item>
          <el-descriptions-item label="默认语言">{{ info.defaultLocale }}</el-descriptions-item>
          <el-descriptions-item label="站点描述">{{ info.siteDescription }}</el-descriptions-item>
        </el-descriptions>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>技术与运行环境</span>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="框架">{{ info.stack.framework }}</el-descriptions-item>
          <el-descriptions-item label="UI 方案">{{ info.stack.ui }}</el-descriptions-item>
          <el-descriptions-item label="数据库">{{ info.stack.database }}</el-descriptions-item>
          <el-descriptions-item label="运行时">{{ info.stack.runtime }}</el-descriptions-item>
          <el-descriptions-item label="渲染模式">{{ info.stack.renderMode }}</el-descriptions-item>
        </el-descriptions>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>SEO 与索引状态</span>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Sitemap">{{ info.seo.sitemap }}</el-descriptions-item>
          <el-descriptions-item label="Robots">{{ info.seo.robots }}</el-descriptions-item>
          <el-descriptions-item label="Canonical">
            {{ info.seo.canonicalEnabled ? '已启用' : '未启用' }}
          </el-descriptions-item>
          <el-descriptions-item label="后台屏蔽抓取">
            {{ info.seo.adminBlocked ? '已屏蔽' : '未屏蔽' }}
          </el-descriptions-item>
        </el-descriptions>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span>内容结构总览</span>
        </template>
        <div class="content-grid">
          <div class="content-metric">
            <span>文章</span>
            <strong>{{ info.content.totalArticles }}</strong>
          </div>
          <div class="content-metric">
            <span>分类</span>
            <strong>{{ info.content.totalCategories }}</strong>
          </div>
          <div class="content-metric">
            <span>标签</span>
            <strong>{{ info.content.totalTags }}</strong>
          </div>
          <div class="content-metric">
            <span>最近更新</span>
            <strong>{{ latestUpdatedText }}</strong>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import siteService from '@/services/site.service'
import { formatDateTime } from '@/utils/format'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const loading = ref(false)
const info = ref({
  siteName: '',
  siteUrl: '',
  siteAuthor: '',
  siteDescription: '',
  defaultLocale: 'zh',
  content: {
    totalArticles: 0,
    totalCategories: 0,
    totalTags: 0,
    latestUpdatedAt: null as string | null
  },
  seo: {
    sitemap: '',
    robots: '',
    canonicalEnabled: false,
    adminBlocked: false
  },
  stack: {
    framework: '',
    ui: '',
    database: '',
    runtime: '',
    renderMode: ''
  }
})

const latestUpdatedText = computed(() =>
  info.value.content.latestUpdatedAt
    ? formatDateTime(info.value.content.latestUpdatedAt)
    : '暂无更新记录'
)

const summaryCards = computed(() => [
  {
    key: 'articles',
    label: '文章总数',
    value: info.value.content.totalArticles,
    desc: '当前公开文章规模'
  },
  {
    key: 'categories',
    label: '分类总数',
    value: info.value.content.totalCategories,
    desc: '站点分类结构数量'
  },
  {
    key: 'tags',
    label: '标签总数',
    value: info.value.content.totalTags,
    desc: '已启用标签数量'
  },
  {
    key: 'seo',
    label: '索引状态',
    value: info.value.seo.canonicalEnabled ? '正常' : '待检查',
    desc: 'Canonical 与 sitemap 状态'
  }
])

const fetchInfo = async () => {
  loading.value = true
  try {
    const res: any = await siteService.getInfo()
    if (res?.status === 200 && res.data) {
      info.value = res.data
      return
    }
    ElMessage.error(res?.msg || '获取网站信息失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '获取网站信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchInfo()
})
</script>

<style scoped lang="less">
.site-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 24px;
  border: 1px solid rgba(0, 105, 217, 0.14);
  background:
    radial-gradient(circle at top right, rgba(0, 105, 217, 0.12), transparent 26%),
    linear-gradient(140deg, var(--card-color), color-mix(in srgb, var(--card-color) 86%, #edf5ff));
}

.site-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.site-title {
  margin: 0;
  font-size: 30px;
  color: var(--text-color);
}

.site-desc {
  margin: 12px 0 0;
  max-width: 640px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.content-metric {
  padding: 16px;
  border-radius: 18px;
  background: var(--bg-color, #f7f9fc);
  border: 1px solid var(--border-color);

  span {
    display: block;
    font-size: 12px;
    color: var(--tertiary-color);
  }

  strong {
    display: block;
    margin-top: 8px;
    font-size: 20px;
    color: var(--text-color);
  }
}

@media (max-width: 960px) {
  .site-hero {
    flex-direction: column;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
