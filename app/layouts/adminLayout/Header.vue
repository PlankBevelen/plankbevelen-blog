<template>
  <header class="header" >
    <div class="headerWrapper">
      <div class="logo">
        <NuxtImg
          src="/img/logo.jpg"
          alt="logo"
          quality="70"
          loading="eager"
          fetchpriority="high"
          class="logo-img"
          :width="40"
          :height="40"
        />
        <span class="logo-text">{{ t('common.title') }}</span>
      </div>
      <div class="navbar">
        <div class="close" @click="$emit('toggle')"><nuxt-icon name="admin/close"></nuxt-icon></div>
        <div class="title">{{ navTitle }}</div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

defineProps<{ collapsed: boolean; navTitle: string }>()
defineEmits<{ (e: 'toggle'): void }>()
</script>

<style lang="less" scoped>
.header {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: @header-height;
  background-color: var(--header-color);
  color: var(--text-color);
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
  .headerWrapper {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 60px;
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      .logo-img {
        width: 40px;
        height: 40px;
        object-fit: cover;        
        border-radius: @small-border-radius;
      }
    }
    .navbar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-left: 24px;
      .close {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-color);
        border-radius: @base-border-radius;
        cursor: pointer;
        background-color: var(--card-color);
        color: var(--text-color);
      }
      .close:hover { background-color: var(--shallow-hover-bg-color); }
      .close:active { background-color: var(--shallow-active-bg-color); }
      .close .nuxt-icon { color: var(--text-color); }
      .title {
        font-size: 16px;
        color: var(--text-color);
      }
    }
  }
}
</style>

