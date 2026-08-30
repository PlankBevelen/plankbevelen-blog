<template>
  <header class="header" :class="{ 'is-mobile': isMobile }">
    <div class="headerWrapper container">
      <div class="logo">
        <!-- <img
          src="/favicon.ico"
          alt="logo"
          loading="eager"
          fetchpriority="high"
          class="logo-img"
        /> -->
        <span class="logo-text cursor-pointer hover:scale-105 transition-transform duration-300" @click="navigateTo('/')">{{ $t('site.name') }}</span>
      </div>
      
      <ul class="nav-menu" v-if="!isMobile">
        <li v-for="item in navList" :key="item.path" class="nav-item">
          <NuxtLink :to="localePath(item.path)" class="nav-link">{{ $t(item.key) }}</NuxtLink>
        </li>
      </ul>
      <button class="mobile-menu-btn" v-if="isMobile" type="button" :aria-expanded="mobileMenuOpen" aria-label="菜单" @click="toggleMobileMenu">
        <nuxt-icon :name="mobileMenuOpen ? 'header/close' : 'header/menu'" />
      </button>

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
            <span class="lang-item" @click="changeLocale('en')" :class="{'active': currentLocale === 'en'}">{{ $t('lang.en') }}</span>
            <span class="lang-item" @click="changeLocale('zh')" :class="{'active': currentLocale === 'zh'}">{{ $t('lang.zh') }}</span>
          </div>
        </span>
      </div>
    </div>

    <Transition name="slide-fade">
      <div class="mobile-menu-drawer" v-if="isMobile && mobileMenuOpen">
        <ul class="mobile-nav-list">
          <li v-for="item in navList" :key="item.path" class="mobile-nav-item" @click="closeMobileMenu">
            <NuxtLink :to="localePath(item.path)" class="mobile-nav-link">{{ $t(item.key) }}</NuxtLink>
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
              <span class="lang-opt" :class="{ active: currentLocale === 'zh' }" @click="changeLocale('zh')">ZH</span>
              <span class="divider">/</span>
              <span class="lang-opt" :class="{ active: currentLocale === 'en' }" @click="changeLocale('en')">EN</span>
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
import { useUserAgent } from '@/composables/useUseragent'

const admin = useAdminStore()
const themeSwitch = computed({ get(){ return admin.getTheme === 'dark' }, set(v){ admin.setTheme(v ? 'dark' : 'light') } })
// 以 i18n 实际 locale 为唯一权威（URL 前缀决定），而非 store 里的副本，避免直连 /en/... 时高亮错位
const { locale: i18nLocale } = useI18n()
const currentLocale = computed(() => (i18nLocale.value === 'en' ? 'en' : 'zh'))
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

// i18n locale 变化时同步到 store，保证 Element Plus 语言包（app.vue 的 elLocale）一致
watch(i18nLocale, (v) => {
  admin.setLocale(v === 'en' ? 'en' : 'zh')
})

const changeLocale = async (locale: 'en' | 'zh') => {
  const target = switchLocalePath(locale)
  if (target) await navigateTo(target, { replace: true })
}

const navList = [
  { key: 'header.nav.home', path: '/' },
  { key: 'header.nav.notes', path: '/notes' },
  { key: 'header.nav.article', path: '/article' },
  { key: 'header.nav.project', path: '/project' },
  { key: 'header.nav.friends', path: '/friends' },
  { key: 'header.nav.about', path: '/about' },
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
  z-index: @z-header;
  border-bottom: 1px solid var(--border-color);
  transition: transform @transition-base ease-in-out, background-color @transition-base ease-in-out;

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
      gap: @space-base;
      .logo-img {
        width: 54px;
        height: 54px;
        object-fit: cover;        
        border-radius: @small-border-radius;
      }
      .logo-text {
        font-size: @base-title-size;
        font-weight: bold;
      }
    }
    .nav-menu {
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
      .nav-item {
        margin-left: @space-3xl;        
      }
      .nav-link {
        color: var(--text-color);
        text-decoration: none;
        position: relative;
        padding-bottom: 5px;
        font-size: @font-size-md;
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
          transition: transform @transition-base ease-in-out;
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
      gap: @space-lg;
      align-items: center;
      .lang {
        position: relative;
        cursor: pointer;
        font-size: @font-size-xl;
        &:hover {
          .lang-choose { opacity: 1; transform: translateX(-50%) scaleY(1); pointer-events: auto; }
        }
        .lang-choose {
          display: flex;
          font-size: var(--el-font-size-small);
          position: absolute;
          top: 100%;
          left: 50%;
          opacity: 0;
          background-color: var(--header-color);
          color: var(--text-color);
          padding: @space-base @space-lg;
          border-radius: @small-border-radius;
          box-shadow: @shadow-card;
          flex-direction: column;
          gap: @space-base;
          transform: translateX(-50%) scaleY(0);
          transform-origin: top center;
          transition: transform @transition-base ease-in-out, opacity @transition-fast ease-in-out;
          pointer-events: none;
          will-change: transform, opacity;
          .lang-item {
            cursor: pointer;
            padding: @space-2xs @space-base;
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
    font-size: @font-size-2xl;
    cursor: pointer;
    padding: @space-base;
    color: var(--text-color);
    background: transparent;
    border: none;
  }

  .mobile-menu-drawer {
    position: absolute;
    top: @header-height;
    left: 0;
    width: 100%;
    background-color: var(--header-color);
    border-bottom: 1px solid var(--border-color);
    padding: @space-3xl;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: @space-3xl;

    .mobile-nav-list {
      display: flex;
      flex-direction: column;
      gap: @space-2xl;
      list-style: none;

      .mobile-nav-item {
        .mobile-nav-link {
          display: block;
          font-size: @base-font-size;
          color: var(--text-color);
          text-decoration: none;
          padding: @space-base 0;
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
      padding-top: @space-md;
      
      .control-item {
        display: flex;
        align-items: center;
        gap: @space-md;
        font-size: @font-size-sm;
        
        .lang-toggle {
          display: flex;
          align-items: center;
          gap: @space-2xs;
          
          .lang-opt {
            cursor: pointer;
            padding: 2px @space-xs;
            border-radius: 4px;
            font-size: var(--el-font-size-small);
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
  transition: all @transition-base ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
