<template>
  <div class="privacy-page">
    <div class="container">
      <BaseCard class="privacy-card">
        <h1 class="privacy-title">{{ $t('pages.privacy.title') }}</h1>
        <p class="privacy-updated">{{ $t('pages.privacy.updated') }}</p>
        <p class="privacy-intro">{{ $t('pages.privacy.intro') }}</p>

        <section class="privacy-section">
          <h2 class="privacy-section__title">{{ $t('pages.privacy.collect.title') }}</h2>
          <p class="privacy-section__body">{{ $t('pages.privacy.collect.body') }}</p>
        </section>

        <section class="privacy-section">
          <h2 class="privacy-section__title">{{ $t('pages.privacy.usage.title') }}</h2>
          <p class="privacy-section__body">{{ $t('pages.privacy.usage.body') }}</p>
        </section>

        <section class="privacy-section">
          <h2 class="privacy-section__title">{{ $t('pages.privacy.contact.title') }}</h2>
          <p class="privacy-section__body">{{ $t('pages.privacy.contact.body') }}</p>
        </section>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageSeo } from '@/composables/useSeo'

const { t } = useI18n()

usePageSeo({
  title: t('pages.privacy.title'),
  description: t('pages.privacy.meta.description')
})
</script>

<style lang="less" scoped>
.privacy-page {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: @space-5xl;
    padding-bottom: @space-5xl;
  }
}

.privacy-card {
  :deep(.card-content) {
    padding: @space-5xl;
  }
}

.privacy-title {
  margin: 0 0 @space-base;
  font-size: @font-size-xxl;
  font-weight: 700;
  color: var(--text-color);
}

.privacy-updated {
  margin: 0 0 @space-4xl;
  font-size: @font-size-xs;
  color: var(--tertiary-color);
}

.privacy-intro {
  margin: 0 0 28px;
  font-size: @font-size-md;
  color: var(--secondary-color);
  line-height: 1.8;
}

.privacy-section {
  margin-bottom: @space-4xl;

  &__title {
    margin: 0 0 @space-base;
    font-size: @font-size-lg;
    font-weight: 600;
    color: var(--text-color);
  }

  &__body {
    margin: 0;
    font-size: @font-size-md;
    color: var(--secondary-color);
    line-height: 1.9;
  }
}
</style>
