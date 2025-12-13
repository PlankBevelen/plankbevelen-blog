<template>
  <header class="header" :class="{ 'is-mobile': isMobile }">
    <div class="headerWrapper container">
      <div class="logo">
        <NuxtImg
          provider="ipx"
          src="/img/logo.webp"
          alt="logo"
          quality="70"
          loading="eager"
          fetchpriority="high"
          class="logo-img"
          width="40"
          height="40"
        />
        <span class="logo-text">{{ $t('common.title') }}</span>
      </div>
      
      <ul class="nav-menu" v-if="!isMobile">
        <li v-for="item in navList" :key="item.path" class="nav-item">
          <NuxtLink :to="item.path" class="nav-link">{{ $t(item.key) }}</NuxtLink>
        </li>
      </ul>
      <div class="mobile-menu-btn" v-if="isMobile" @click="toggleMobileMenu">
        <nuxt-icon :name="mobileMenuOpen ? 'header/close' : 'header/menu'" />
      </div>

      <div class="controls" v-if="!isMobile">
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
            <span class="lang-item" @click="admin.setLocale('en')" :class="{'active': currentLocale === 'en'}">{{ $t('lang.en') }}</span>
            <span class="lang-item" @click="admin.setLocale('cn')" :class="{'active': currentLocale === 'cn'}">{{ $t('lang.cn') }}</span>
          </div>
        </span>
      </div>
    </div>

    <Transition name="slide-fade">
      <div class="mobile-menu-drawer" v-if="isMobile && mobileMenuOpen">
        <ul class="mobile-nav-list">
          <li v-for="item in navList" :key="item.path" class="mobile-nav-item" @click="closeMobileMenu">
            <NuxtLink :to="item.path" class="mobile-nav-link">{{ $t(item.key) }}</NuxtLink>
          </li>
        </ul>
        <div class="mobile-controls">
          <div class="control-item">
            <span>{{ $t('theme.' + (themeSwitch ? 'dark' : 'light')) }}</span>
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
          </div>
          <div class="control-item">
            <span>{{ $t('lang.' + currentLocale) }}</span>
            <div class="lang-toggle">
              <span class="lang-opt" :class="{ active: currentLocale === 'cn' }" @click="admin.setLocale('cn')">CN</span>
              <span class="divider">/</span>
              <span class="lang-opt" :class="{ active: currentLocale === 'en' }" @click="admin.setLocale('en')">EN</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useUserAgent } from '@/composables/useUserAgent'

const admin = useAdminStore()
const themeSwitch = computed({ get(){ return admin.getTheme === 'dark' }, set(v){ admin.setTheme(v ? 'dark' : 'light') } })
const currentLocale = computed(() => admin.getLocale)

const navList = [
  { key: 'header.nav.home', path: '/' },
  { key: 'header.nav.article', path: '/article' },
  { key: 'header.nav.about', path: '/about' },
  { key: 'header.nav.project', path: '/project' },
]

const { isMobile } = useUserAgent()
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

watch(isMobile, (val) => {
  if (!val) {
    mobileMenuOpen.value = false
  }
})

onMounted(()=>{
  admin.initPreferences()
  
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentScrollY = window.scrollY;
    mobileMenuOpen.value = false 
    
    // 向下滚动超过100px且继续向下滚动时隐藏
    if (currentScrollY > 100 && currentScrollY > lastScrollY) {
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
  transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;

  &.hidden {
    transform: translateY(-100%);
  }

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
      font-size: 16px;
      .nav-item {
        margin-left: 20px;
      }
      .nav-link {
        color: var(--text-color);
        text-decoration: none;
        position: relative;
        padding-bottom: 5px;
        font-size: 16px;
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
          color: var(--primary-hover-color);
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
              background-color: var(--shallow-hover-bg-color);
            }
          }
        }
      }
    }
  }

  // 移动端样式
  .mobile-menu-btn {
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    color: var(--text-color);
  }

  .mobile-menu-drawer {
    position: absolute;
    top: @header-height;
    left: 0;
    width: 100%;
    background-color: var(--header-color);
    border-bottom: 1px solid var(--border-color);
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 20px;

    .mobile-nav-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      list-style: none;

      .mobile-nav-item {
        .mobile-nav-link {
          display: block;
          font-size: 16px;
          color: var(--text-color);
          text-decoration: none;
          padding: 8px 0;
          border-bottom: 1px dashed var(--border-color);
          
          &.router-link-active {
            color: var(--active-color);
            font-weight: bold;
            border-bottom-style: solid;
          }
        }
      }
    }

    .mobile-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      
      .control-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        
        .lang-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          
          .lang-opt {
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 4px;
            &.active {
              background-color: var(--active-color);
              color: #fff;
            }
          }
        }
      }
    }
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
