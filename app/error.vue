<template>
  <div class="error-page">
    <div class="error-container">
      <div class="illustration">
        <NuxtImg 
          provider="ipx"
          src="/img/404.webp"
          format="webp"
          alt="404 Page Not Found"
          class="error-img"
          :width="600"
          loading="eager"
          quality="90"
        />
        <div class="shadow"></div>
      </div>
      
      <div class="content">
        <h1 class="title">404</h1>
        <p class="subtitle">哎呀，页面好像迷路了</p>
        <p class="description">您访问的页面可能已被删除、更名或暂时不可用。</p>
        
        <div class="actions">
          <NuxtLink to="/" class="btn primary">
            返回首页
          </NuxtLink>
          <button @click="goBack" class="btn secondary">
            返回上一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style lang="less" scoped>
.error-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-color);
  padding: @space-3xl;
  position: relative;
  overflow: hidden;

  // 背景装饰圆
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
    opacity: 0.15;
  }

  &::before {
    width: 300px;
    height: 300px;
    background: var(--primary-color);
    top: -50px;
    left: -50px;
  }

  &::after {
    width: 400px;
    height: 400px;
    background: #409eff;
    bottom: -100px;
    right: -100px;
  }
}

.error-container {
  position: relative;
  z-index: @z-base;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px;
  width: 100%;
  
  // 玻璃拟态效果
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: @radius-xl;
  padding: @space-5xl;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);

  @media (min-width: @screen-md) {
    padding: 60px;
  }
}

.illustration {
  position: relative;
  margin-bottom: @space-5xl;

  .error-img {
    width: 280px;
    height: auto;
    object-fit: contain;
    animation: float 6s ease-in-out infinite;
    
    @media (min-width: @screen-md) {
      width: 400px;
    }
  }

  .shadow {
    width: 150px;
    height: 20px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    margin: @space-3xl auto 0;
    filter: blur(5px);
    animation: shadow 6s ease-in-out infinite;

    @media (min-width: @screen-md) {
      width: 200px;
    }
  }
}

.content {
  .title {
    font-size: 60px;
    font-weight: 800;
    color: var(--primary-color);
    margin: 0;
    line-height: 1;
    background: linear-gradient(135deg, var(--primary-color), #409eff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (min-width: @screen-md) {
      font-size: 80px;
    }
  }

  .subtitle {
    font-size: @font-size-xl;
    font-weight: 600;
    color: var(--color-text);
    margin: @space-2xl 0 @space-base;

    @media (min-width: @screen-md) {
      font-size: @font-size-2xl;
    }
  }

  .description {
    font-size: @font-size-sm;
    color: var(--color-text-secondary, #666);
    margin-bottom: 32px;
    max-width: 400px;
    line-height: 1.6;

    @media (min-width: @screen-md) {
      font-size: @base-font-size;
    }
  }
}

.actions {
  display: flex;
  gap: @space-2xl;
  width: 100%;
  max-width: 300px;
  justify-content: space-between;

  @media (min-width: 480px) {
    flex-direction: row;
    width: auto;
    max-width: none;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: @space-base;
    padding: @space-lg @space-4xl;
    border-radius: 50px;
    font-size: @base-font-size;
    font-weight: 500;
    cursor: pointer;
    transition: all @transition-base cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    border: none;
    outline: none;

    .icon {
      font-size: @font-size-lg;
    }

    &.primary {
      background: var(--primary-color);
      color: #fff;
      box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 64, 158, 255), 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(var(--primary-color-rgb, 64, 158, 255), 0.4);
        background: var(--primary-hover-color, #66b1ff);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &.secondary {
      background: transparent;
      color: var(--color-text);
      border: 1px solid var(--border-color, #ddd);

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes shadow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(0.85);
    opacity: 0.3;
  }
}
</style>
