<template>
  <div class="error-shell">
    <ClientOnly>
      <BaseParticles v-if="isDark" />
    </ClientOnly>
    <LayoutDefaultHeader />
    <main id="main">
      <div class="error-page">
        <div class="container">
          <BaseCard class="error-card">
            <p class="error-kicker">{{ statusCode }}</p>
            <h1 class="error-title">{{ title }}</h1>
            <p class="error-desc">{{ description }}</p>
            <p v-if="path" class="error-path">{{ path }}</p>
            <div class="error-actions">
              <el-button type="primary" @click="goHome">{{ t('error.home') }}</el-button>
              <el-button @click="goBack">{{ t('error.back') }}</el-button>
            </div>
            <p class="error-more">
              <button type="button" class="error-more-link" @click="goArticles">{{ t('error.articles') }}</button>
            </p>
          </BaseCard>
        </div>
      </div>
    </main>
    <LayoutDefaultFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'
import { useAdminStore } from '~/stores/admin.store'

const props = defineProps({
  error: Object as () => NuxtError,
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const admin = useAdminStore()

const isDark = computed(() => admin.getTheme === 'dark')
const statusCode = computed(() => props.error?.statusCode || 404)
const isNotFound = computed(() => statusCode.value === 404)
const title = computed(() => (isNotFound.value ? t('error.notFound.title') : t('error.failed.title')))
const description = computed(() =>
  isNotFound.value ? t('error.notFound.description') : t('error.failed.description')
)
const path = computed(() => route.path || '')

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  robots: 'noindex, nofollow',
})

function goHome() {
  clearError({ redirect: localePath('/') })
}

function goArticles() {
  clearError({ redirect: localePath('/article') })
}

function goBack() {
  const back = import.meta.client ? window.history.state?.back : null
  if (typeof back === 'string' && back.length > 0) {
    clearError({ redirect: back })
    return
  }
  goHome()
}
</script>

<style lang="less" scoped>
.error-page {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: @space-5xl;
    padding-bottom: @space-5xl;
  }
}

.error-card {
  &:hover {
    transform: none;
    box-shadow: @shadow-card;
  }

  :deep(.card-content) {
    padding: @space-5xl;
  }
}

.error-kicker {
  margin: 0;
  font-size: @font-size-xs;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--primary-color);
}

.error-title {
  margin: @space-lg 0 0;
  font-size: @font-size-xxl;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
}

.error-desc {
  margin: @space-2xl 0 0;
  max-width: 36em;
  font-size: @font-size-md;
  color: var(--secondary-color);
  line-height: 1.8;
}

.error-path {
  margin: @space-lg 0 0;
  font-size: @font-size-sm;
  color: var(--tertiary-color);
  word-break: break-all;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: @space-lg;
  margin-top: @space-4xl;
}

.error-more {
  margin: @space-3xl 0 0;
}

.error-more-link {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: @font-size-sm;
  color: var(--primary-color);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}
</style>
