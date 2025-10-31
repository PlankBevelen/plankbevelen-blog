<template>
  <footer class="footer">
    <div class="footer-container">
        <p>&copy; 2025 数智聚析. 保留所有权利.</p>
        <p><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">鄂ICP备2025140453号</a></p>
    </div>
  </footer>
</template>

<script lang="ts" setup>

</script>

<style lang="less" scoped>
.footer {
  background: #001529;
  color: #fff;
  margin-top: auto;
  
  .footer-container {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    padding: 20px;
    

    p{
      font-size: 14px;
    }

    a {
      color: #fff;
      text-decoration: none;
      &:hover {
        color: var(--secondary-color);
      }
    }
  }
  
  @media (max-width: 768px) {
    .footer-container {
      padding: 12px;
    }
  }
}
</style>
