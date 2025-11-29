<template>
  <header class="header" >
    <div class="headerWrapper container">
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
      <ul class="nav-menu">
        <li v-for="item in navList" :key="item.path" class="nav-item">
          <NuxtLink :to="item.path" class="nav-link">{{ t(item.key) }}</NuxtLink>
        </li>
      </ul>
      <div class="controls">
        <el-switch 
          v-model="themeSwitch" 
          inline-prompt 
        >
          <template #active-action>
            <nuxt-icon name="header/moon" />
          </template>
          <template #inactive-action>
            <nuxt-icon name="header/sun" />
          </template>
        </el-switch>
        <span class="lang">
          <nuxt-icon name="header/language" />
          <div class="lang-choose">
            <span class="lang-item" @click="admin.setLocale('en')" :class="{'active': currentLocale === 'en'}">{{ t('lang.en') }}</span>
            <span class="lang-item" @click="admin.setLocale('cn')" :class="{'active': currentLocale === 'cn'}">{{ t('lang.cn') }}</span>
          </div>
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
const admin = useAdminStore()
const themeSwitch = computed({ get(){ return admin.getTheme === 'dark' }, set(v){ admin.setTheme(v ? 'dark' : 'light') } })
const currentLocale = computed(() => admin.getLocale)
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const navList = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.article', path: '/article' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.project', path: '/project' },
]

onMounted(()=>{
  admin.initPreferences()
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentScrollY = window.scrollY;
    
    // 向下滚动超过100px且继续向下滚动时隐藏
    if (currentScrollY > 300 && currentScrollY > lastScrollY) {
      header?.classList.add('hidden');
    } 
    // 向上滚动时显示
    else if (currentScrollY < lastScrollY) {
      header?.classList.remove('hidden');
    }
    
    lastScrollY = currentScrollY;
  })
})
</script>

<style lang="less" scoped>
.header {
  position: fixed;
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
    justify-content: space-between;
    align-items: center;
    height: 100%;
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
    .nav-menu {
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
      .nav-item {
        margin-left: 20px;
      }
      .nav-link {
        color: var(--text-color);
        text-decoration: none;
        position: relative;
        padding-bottom: 5px;
        &::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 100%;
          background: var(--active-color);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.3s ease-in-out;
        }
        &.router-link-active {
          color: var(--active-color);
          font-weight: bold;
          &::after { transform: scaleX(1); }
        }
        &:hover {
          &::after { transform: scaleX(1); }
          color: var(--active-color);
        }
      }
    }
    .controls {
      display: flex;
      gap: 12px;
      align-items: center;
      .lang { 
        font-size: 24px; 
        position: relative;
        cursor: pointer;
        &:hover {
          .lang-choose { opacity: 1; transform: translateX(-50%) scaleY(1); pointer-events: auto; }
        }
        .lang-choose {
          display: flex;
          font-size: 0.8rem;
          position: absolute;
          top: 100%;
          left: 50%;
          opacity: 0;
          background-color: var(--header-color);
          color: var(--text-color);
          padding: 8px 12px;
          border-radius: @small-border-radius;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          flex-direction: column;
          gap: @base-gap;
          transform: translateX(-50%) scaleY(0);
          transform-origin: top center;
          transition: transform 0.3s ease-in-out, opacity 0.2s ease-in-out;
          pointer-events: none;
          will-change: transform, opacity;
          .lang-item {
            cursor: pointer;
            padding: 4px 8px;
            border-radius: @small-border-radius;
            &.active {
              background-color: var(--active-color);
              color: var(--header-color);
            }
            &:hover {
              background-color: var(--active-color);
              color: var(--header-color);
            }
          }
        }
      }
    }
  }
}
</style>
