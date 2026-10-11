<template>
  <footer class="footer">
    <div class="footer-content container">      
      <div class="site-info">
        <p class="site-description">{{ $t('footer.description') }}</p>
      </div>
      <div class="footer-bottom">
        <p class="copy">© {{ year }} {{ $t('footer.copyright') }}</p>
        <div class="footer-links">
          <NuxtLink :to="localePath('/privacy')" class="privacy-link">{{ $t('pages.privacy.title') }}</NuxtLink>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"> {{ $t('footer.beian') }} </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
const localePath = useLocalePath()
</script>

<style lang="less" scoped>
.footer {
  padding: @space-3xl 0;
  background-color: var(--header-color);
  border-top: 1px solid var(--border-color);
  .footer-content {
    text-align: center;
    height: 100%;
    .site-info {
       margin-bottom: @space-2xl;
       p {
        margin: 0;
        font-size: @base-font-size;
        font-weight: normal;
        color: var(--mute-color);
       }
    }
    .footer-bottom {      
      p {
        font-size: @font-size-sm;
        font-weight: normal;
        color: var(--mute-color);
      }
      a {
        font-size: @font-size-sm;
        font-weight: normal;
        color: var(--mute-color);
        text-decoration: none;
        &:hover {
          color: var(--primary-hover-color);
        }
      }
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .footer-links {
        display: flex;
        gap: @space-3xl;
        align-items: center;
      }
    }
  }
}
</style>
