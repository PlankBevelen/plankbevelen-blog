<template>
    <div class="login">
        <canvas class="bg-canvas" ref="canvasRef"></canvas>
        <div class="login-wrapper">
          <div class="left">
            <div class="left-wrapper">
              <img src="/logo.jpg" alt="logo" class="logo">
              <h1 class="title">PlankBevelen Blog Admin</h1>
              <p class="subtitle">后台管理系统</p>
              <ul class="feature-list">
                <li class="feature-item"><div class="feature-icon"><nuxt-icon name="global/check" /></div>现代化UI设计</li>
                <li class="feature-item"><div class="feature-icon"><nuxt-icon name="global/check" /></div>响应式布局</li>
                <li class="feature-item"><div class="feature-icon"><nuxt-icon name="global/check" /></div>开箱即用</li>
              </ul>
            </div>
          </div>
          <div class="right">
            <Card class="login-card">
              <h2 class="title">欢迎回来</h2>
              <p class="subtitle">登录您的账户</p>
              <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form">
                <el-form-item prop="account" class="form-item">
                    <el-input v-model="form.account" placeholder="请输入账号" clearable />
                </el-form-item>
                <el-form-item prop="password" class="form-item">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>
                <div class="form-item extras">
                    <el-checkbox v-model="form.remember">记住我</el-checkbox>
                </div>
                <el-button type="primary" class="submit" :loading="loading" @click="onSubmit">登录</el-button>
              </el-form>
            </Card>
          </div>
        </div>        
    </div>
    
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import Card from '@/components/cards/card.vue'
import { useAdminStore } from '@/stores/admin.store'
import { navigateTo } from 'nuxt/app'

const formRef = ref()
const loading = ref(false)
const form = ref({ account: '', password: '', remember: true })
const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const onSubmit = async () => {
  (formRef.value as any)?.validate(async (valid: boolean) => {
    if (!valid) return
    loading.value = true
    try {      
      const success = await useAdminStore().login(form.value.account, form.value.password, form.value.remember)
      if(success) {
        navigateTo('/admin', { replace: true })
      } else {
        ElMessage.error('登录失败，请检查账号或密码')
      }      
    } catch (e: any) {
      const msg = e?.data?.message || '登录失败，请检查账号或密码'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}

// canvas背景
const canvasRef = ref<HTMLCanvasElement>()
function hexToRGBA(hex: string, alpha = 1) {
  const h = hex.replace('#', '').trim()
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16)
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16)
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
function drawGrid() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const style = getComputedStyle(document.documentElement)
  const minor = hexToRGBA(style.getPropertyValue('--border-color') || '#e5e5e5', 0.25)
  const major = hexToRGBA(style.getPropertyValue('--active-color') || '#007bff', 0.15)
  const size = 32
  const majorStep = 5
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += size) {
    ctx.beginPath()
    ctx.strokeStyle = ((x / size) % majorStep === 0) ? major : minor
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y <= h; y += size) {
    ctx.beginPath()
    ctx.strokeStyle = ((y / size) % majorStep === 0) ? major : minor
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
}
onMounted(() => {
  drawGrid()
  window.addEventListener('resize', drawGrid)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', drawGrid)
})
</script>

<style scoped lang="less">
.login {
  height: 100vh;
  width: 100vw;
  .login-wrapper {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    .left {
      height: 100%;
      width: 100%;
      background: #282828;
      display: flex;
      justify-content: center;
      flex-direction: column;
      text-align: center;
      .left-wrapper { width: fit-content; margin: 0 auto; }
      .logo {
        height: 120px;
        width: auto;
        margin: 0 auto;
        display: block;
        object-fit: cover;
        border-radius: @small-border-radius;
        animation: float 4s ease-in-out infinite;
        margin-bottom: 60px;
      }
      .title {
        color: #fff;
        font-size: 32px;
        font-weight: bold;
        background: linear-gradient(90deg, #007bff, #00c6ff);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        line-height: normal;
        margin-bottom: 24px;
      }
      .subtitle {
        color: #fff;
        font-size: 24px;
        font-weight: normal;
        line-height: normal;
        margin-bottom: 48px;
      }
      .feature-list {        
        font-size: 16px;
        font-weight: normal;
        margin-top: 30px;
        list-style: none;
        padding: 0;
        margin: 0;
        line-height: normal;
        text-align: left;
      }
      .feature-item {
        margin-bottom: 10px;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 20px;
        &:not(:last-child) { margin-bottom: 20px; }
        .feature-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
    .right {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .login-card {
        width: 50%;
        height: auto;
        padding: 40px 60px;
        .title {
          font-size: 28px;
          font-weight: bold;
          line-height: normal;
          text-align: center;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 16px;
          font-weight: normal;
          line-height: normal;
          text-align: center;
          color: var(--mute-color);
          margin-bottom: 24px;
        }
        .form-item {
          &:not(:last-child) { margin-bottom: 32px; }
          &.extras {
            border: 1px solid var(--border-color);
            border-radius: @base-border-radius;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding: 8px 12px;
          }
        }
        :deep(.el-button.submit) {
          width: 100%;
          border-radius: @base-border-radius;
          background: var(--primary-color);
          padding: 12px 12px;          
          border: none;
          line-height: normal;
          height: auto;
          span { color: #fff; }
        }
        :deep(.el-button.submit:hover) {
          filter: brightness(1.05);
          box-shadow: 0 6px 12px rgba(0,0,0,0.12);
          background: var(--primary-color-03);
        }
        :deep(.el-button.submit:active) {
          filter: brightness(0.95);
          background: var(--primary-color-06);
        }
        :deep(.el-input__wrapper) {
          background-color: transparent;
          box-shadow: none;
          border: 1px solid var(--border-color);
          border-radius: @base-border-radius;
          padding: 8px 12px;
        }
        :deep(.el-input__inner) {
          background: transparent;
        }
      }
    }
  }
}
.bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
