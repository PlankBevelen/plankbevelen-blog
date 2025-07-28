<template>
  <div class="message-full-screen">
    <div class="star-meteor-container">
      <!-- 星星 -->
      <div class="stars">

      </div>
      <!-- 流星 -->
      <div class="meteors" ref="meteorsContainer">
        <div class="meteor" style="width: 200px; height: 100px; left: 50%; top: 30%;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const meteorsContainer = ref<HTMLDivElement | null>(null)
let meteorInterval: ReturnType<typeof setInterval> | null = null

// 创建流星
const createMeteor = () => {
  if (!meteorsContainer.value) return

  const meteor = document.createElement('div');
  meteor.className = 'meteor';

  // 随机位置
  const left = Math.random() * 100;
  const top = Math.random() * 30;
  const size = Math.random() * 2 + 1;
  const duration = Math.random() * 2 + 1.5;

  meteor.style.left = `${left}%`
  meteor.style.top = `${top}%`
  meteor.style.width = `${size}px`
  meteor.style.height = `${size}px`
  meteor.style.animationDuration = `${duration}s`
  
  meteorsContainer.value.appendChild(meteor)

  // 动画结束后移除流星
  setTimeout(() => {
    meteor.remove()
  }, duration * 1000)
}

onMounted(() => {
  // 每隔一段时间创建一颗流星
  meteorInterval = setInterval(createMeteor, 1500)
  
  // 初始创建几颗流星
  for (let i = 0; i < 5; i++) {
    setTimeout(createMeteor, i * 500)
  }
})
</script>

<style scoped lang="less">
.message-full-screen {
  background-image: url('/public/img/topBanner/message.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  height: 100vh;
  position: relative;
  z-index: 0;

  .star-meteor-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 10;

    .meteors  {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;

      .meteor {
        position: inherit;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 70%);
        transform-origin: 0 0;
        width: 2px !important;
        height: 1px !important;
        animation: meteorFall linear forwards;
      }

      @keyframes meteorFall {
        0% {
          transform: translate(0, 0) rotate(45deg) scale(1);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        70% {
          opacity: 1;
        }
        100% {
          transform: translate(500px, 500px) rotate(45deg) scale(0.5);
          opacity: 0;
        }
      }

    }
  }
}
</style>