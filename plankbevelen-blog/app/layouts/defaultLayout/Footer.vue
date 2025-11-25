<template>
  <footer class="footer">
    <div class="footer-content container">      
      <div class="site-info"> 
        <h3 class="site-title">Plankbevelen's Blog</h3>
        <p class="site-description">记录生活，分享技术，追求美好</p>
      </div>
      <div class="footer-bottom">
        <p class="copy">© {{ year }} PlankBevelen. All Rights Reserved.</p>
        <a href="https://beian.miit.gov.cn/" target="_blank"> 蜀ICP备2024114585号 </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style lang="less" scoped>
.footer {
  padding: 20px 0;
  background-color: var(--header-color);
  border-top: 1px solid var(--border-color);
  .footer-content {
    text-align: center;
    height: 100%;
    .site-info {
       margin-bottom: 20px;
       h3 {
        font-size: 24px;
        font-weight: bold;
        color: var(--text-color);
        margin-bottom: 10px;
       }
       p {
        font-size: 16px;
        font-weight: normal;
        color: var(--mute-color);
       }
    }
    .footer-bottom {      
      p {
        font-size: 14px;
        font-weight: normal;
        color: var(--mute-color);
      }
      a {
        font-size: 14px;
        font-weight: normal;
        color: var(--mute-color);
        text-decoration: none;
        &:hover {
          color: var(--primary-color);
        }
      }
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
