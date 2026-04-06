<template>
  <div ref="container" class="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none overflow-hidden"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { useAdminStore } from '@/stores/admin.store'

const container = ref<HTMLElement | null>(null)
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let particles: THREE.Points
let animationFrameId: number

const admin = useAdminStore()

const initThree = () => {
  if (!container.value) return

  // Scene setup
  scene = new THREE.Scene()
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 300

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value.appendChild(renderer.domElement)

  // Particles
  const particleCount = 800
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i++) {
    // Spread particles in a wide area
    positions[i] = (Math.random() - 0.5) * 1000
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  // Dynamically set particle color based on theme
  const isDark = admin.getTheme === 'dark'
  const color = isDark ? 0x888888 : 0xcccccc
  
  const material = new THREE.PointsMaterial({
    color: color,
    size: 2,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // Handle Resize
  window.addEventListener('resize', onWindowResize)

  // Start animation loop
  animate()
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  // Slow rotation
  if (particles) {
    particles.rotation.x += 0.0002
    particles.rotation.y += 0.0005
  }

  renderer.render(scene, camera)
}

// Watch theme changes to update particle colors
watch(() => admin.getTheme, (newTheme) => {
  if (particles && particles.material instanceof THREE.PointsMaterial) {
    particles.material.color.setHex(newTheme === 'dark' ? 0x888888 : 0xcccccc)
  }
})

onMounted(() => {
  // Use timeout to ensure it doesn't block main render
  setTimeout(() => {
    initThree()
  }, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  cancelAnimationFrame(animationFrameId)
  if (renderer && container.value) {
    container.value.removeChild(renderer.domElement)
    renderer.dispose()
  }
  if (particles) {
    particles.geometry.dispose()
    if (particles.material instanceof THREE.Material) {
      particles.material.dispose()
    }
  }
})
</script>

<style scoped>
.particle-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}
</style>
