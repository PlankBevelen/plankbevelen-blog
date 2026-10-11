<template>
  <div ref="container" class="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none overflow-hidden"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAdminStore } from '@/stores/admin.store'

const container = ref<HTMLElement | null>(null)
let scene: any
let camera: any
let renderer: any
let particles: any
let animationFrameId: number
let lastFrameTime = 0

const TARGET_FPS = 20
const FRAME_INTERVAL = 1000 / TARGET_FPS

const admin = useAdminStore()

const initThree = async () => {
  if (!container.value) return

  // 动态加载 three，避免将其拉入首页主包
  const THREE = await import('three')

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 300

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }) // antialias 关掉，背景粒子不需要
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // 限制最高 1.5，防止高分屏爆炸
  container.value.appendChild(renderer.domElement)

  const isDark = admin.getTheme === 'dark'
  const particleCount = isDark ? 12000 : 1200
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 1000 // x 不变
    positions[i3 + 1] = (Math.random() - 0.5) * 1000 // y 不变
    positions[i3 + 2] = (Math.random() - 0.5) * 1000 - 300 // z 整体往后偏移，远离摄像机
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: isDark ? 0x888888 : 0x999999,
    size: isDark ? 1.2 : 2,
    transparent: true,
    opacity: isDark ? 0.6 : 0.8,
    sizeAttenuation: true,
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  window.addEventListener('resize', onWindowResize)
  document.addEventListener('visibilitychange', onVisibilityChange)

  animate(0)
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 切换标签页时暂停/恢复，不在后台白白消耗
const onVisibilityChange = () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrameId)
  } else {
    lastFrameTime = 0
    animate(0)
  }
}

const animate = (timestamp: number) => {
  animationFrameId = requestAnimationFrame(animate)

  // 限制帧率，20fps 对粒子背景完全足够
  if (timestamp - lastFrameTime < FRAME_INTERVAL) return
  lastFrameTime = timestamp

  if (particles) {
    particles.rotation.x += 0.0002
    particles.rotation.y += 0.0005
  }

  renderer.render(scene, camera)
}

watch(() => admin.getTheme, (newTheme) => {
  if (particles && particles.material) {
    const isDark = newTheme === 'dark'
    if (typeof particles.material.color?.setHex === 'function') {
      particles.material.color.setHex(isDark ? 0x888888 : 0x999999)
    }
    particles.material.opacity = isDark ? 0.6 : 0.8
    particles.material.needsUpdate = true
  }
})

onMounted(() => {
  setTimeout(() => {
    initThree()
  }, 100)
})

onBeforeUnmount(async () => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('visibilitychange', onVisibilityChange)

  if (renderer && container.value) {
    container.value.removeChild(renderer.domElement)
    renderer.dispose()
  }
  if (particles) {
    particles.geometry.dispose()
    const THREE = await import('three')
    if (particles.material instanceof THREE.Material) {
      particles.material.dispose()
    }
  }
})
</script>
