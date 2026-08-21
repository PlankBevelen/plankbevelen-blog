<template>
  <div class="login-page">
    <div class="login-page__grid" aria-hidden="true"></div>

    <div class="login-card">
      <header class="login-brand">
        <NuxtImg provider="ipx" src="/img/logo.webp" alt="plankbevelen" quality="70" loading="eager" class="login-brand__logo" width="56" height="56" />
        <h1 class="login-brand__name">plankbevelen</h1>
        <p class="login-brand__subtitle">后台管理</p>
      </header>

      <div class="login-form-block">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="login-form"
          @keyup.enter="onSubmit"
        >
          <el-form-item prop="account" label="账号">
            <el-input
              v-model="form.account"
              placeholder="请输入管理员账号"
              size="large"
              clearable
              autofocus
            />
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入登录密码"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item prop="captchaCode" label="验证码">
            <div class="login-form__captcha">
              <el-input
                v-model="form.captchaCode"
                placeholder="请输入验证码"
                size="large"
                clearable
              />
              <div class="captcha-image" @click="refreshCaptcha" title="点击刷新验证码">
                <img v-if="captchaSrc" :src="captchaSrc" alt="验证码" />
                <span v-else class="captcha-placeholder">点击加载</span>
              </div>
            </div>
          </el-form-item>

          <div class="login-form__remember">
            <el-checkbox v-model="form.remember">记住登录状态</el-checkbox>
          </div>

          <el-button
            type="primary"
            class="login-form__submit"
            size="large"
            :loading="loading"
            @click="onSubmit"
          >
            登录后台
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/stores/admin.store'
import adminService from '@/services/admin.service'

definePageMeta({ layout: false })

const adminStore = useAdminStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const captchaId = ref('')
const captchaImage = ref('')
const form = ref({
  account: '',
  password: '',
  captchaCode: '',
  remember: true
})

const captchaSrc = computed(() =>
  captchaImage.value ? `data:image/svg+xml;utf8,${encodeURIComponent(captchaImage.value)}` : ''
)

const refreshCaptcha = async () => {
  try {
    const res: any = await adminService.captcha()
    if (res?.status === 200 && res?.captchaId) {
      captchaId.value = res.captchaId
      captchaImage.value = res.image || ''
    } else {
      captchaImage.value = ''
    }
  } catch {
    captchaImage.value = ''
  } finally {
    form.value.captchaCode = ''
  }
}

const rules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const success = await adminStore.login(
      form.value.account,
      form.value.password,
      form.value.remember,
      captchaId.value,
      form.value.captchaCode
    )

    if (success) {
      ElMessage.success('登录成功')
      await navigateTo('/admin', { replace: true })
      return
    }

    ElMessage.error('账号、密码或验证码错误')
    await refreshCaptcha()
  } catch (error: any) {
    ElMessage.error(error?.data?.message || '登录失败，请稍后重试')
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(refreshCaptcha)
</script>

<style scoped lang="less">
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px @space-3xl;
  overflow: hidden;
  background-color: var(--bg-color);
}

.login-page__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--primary-color) 8%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--primary-color) 8%, transparent) 1px, transparent 1px);
  background-size: 36px 36px;
  opacity: 0.35;
}

.login-card {
  position: relative;
  z-index: @z-base;
  width: min(420px, 100%);
  padding: @space-5xl 36px 36px;
  border-radius: @extra-large-border-radius;
  background-color: var(--card-color);
  border: 1px solid color-mix(in srgb, var(--primary-color) 22%, var(--border-color));
  box-shadow: 0 12px 32px color-mix(in srgb, var(--text-color) 6%, transparent);
}

.login-brand {
  text-align: center;
  margin-bottom: 28px;
}

.login-brand__logo {
  display: block;
  margin: 0 auto;
  box-sizing: content-box;
  padding: @space-base;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background-color: var(--card-color);
}

.login-brand__name {
  margin: 18px 0 0;
  font-size: clamp(28px, 5vw, 36px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: var(--text-color);
  font-weight: 400;
}

.login-brand__subtitle {
  margin: @space-md 0 0;
  font-size: @font-size-sm;
  color: var(--primary-color);
  letter-spacing: 0.12em;
}


.login-form {
  margin-top: 22px;
  display: flex;
  flex-direction: column;

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    color: var(--secondary-color);
  }

  :deep(.el-input__wrapper) {
    border-radius: @base-border-radius;
    box-shadow: 0 0 0 1px var(--border-color);
    background-color: transparent;
    padding: @space-2xs @space-lg;

    &:hover,
    &.is-focus {
      box-shadow: 0 0 0 1px var(--primary-color);
    }
  }

  :deep(.el-input__inner) {
    background: transparent;
    height: 38px;
  }
}

.login-form__remember {
  margin: 0 0 22px;
  color: var(--secondary-color);
}

.login-form__captcha {
  display: flex;
  gap: @space-lg;
  align-items: center;
  width: 100%;

  :deep(.el-input) {
    flex: 1;
  }
}

.captcha-image {
  flex-shrink: 0;
  width: 120px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: @base-border-radius;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .captcha-placeholder {
    font-size: @font-size-xs;
    color: var(--secondary-color);
  }
}

.login-form__submit {
  width: 100%;
  height: 46px;
  border-radius: @base-border-radius;
  font-size: @font-size-md;
  font-weight: 600;
  letter-spacing: 1px;
}

@media (max-width: 480px) {
  .login-page {
    padding: @space-4xl @space-2xl;
  }

  .login-card {
    padding: 32px 22px 28px;
  }
}
</style>
