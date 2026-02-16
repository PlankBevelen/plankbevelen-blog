<template>
  <el-config-provider :locale="elLocale" :z-index="3000">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { config } from 'md-editor-v3'

// 禁用 md-editor-v3 自动加载 highlight.js 和 echarts 的 CDN 资源
config({
  editorConfig: {
    languageUserDefined: {
      'my-lang': {
        /* toolbar: {
          title: '标题',
        } */
      }
    }
  },
  // 设置为空字符串或本地路径来阻止自动请求 CDN
  editorExtensions: {
    highlight: {
      js: '',
      // css: ''
    },
    echarts: {
      js: ''
    },
    katex: {
      js: '',
      css: ''
    },
    cropper: {
      js: '',
      css: ''
    },
    /* iconfont: {
      js: ''
    } */
  }
})

const admin = useAdminStore()
const elLocale = computed(() => admin.getLocale === 'en' ? en : zhCn)

const { t, locale } = useI18n()
useHead(() => ({
  htmlAttrs: { lang: locale.value },
  title: t('site.name'),
  meta: [
    { name: 'title', content: t('site.name') },
    { name: 'description', content: t('site.description') },
    { name: 'keywords', content: 'plankbevelen, 个人博客, 前端开发, Web 技术, 编程经验, 技术文章' },    
  ]
}))
</script>


