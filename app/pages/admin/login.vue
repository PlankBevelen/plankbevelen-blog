<template>
  <div class="login-page">
    <header class="login-top">
      <NuxtLink to="/" class="login-top__home">返回博客</NuxtLink>
      <el-switch v-model="themeSwitch" inline-prompt>
        <template #active-action>
          <BaseIcon name="moon" class="switch-icon" />
        </template>
        <template #inactive-action>
          <BaseIcon name="sun" class="switch-icon" />
        </template>
      </el-switch>
    </header>

    <BaseCard class="login-card" flat>
      <div class="login-card__body">
        <header class="login-brand">
          <h1 class="login-brand__name">plankbevelen</h1>
          <p class="login-brand__subtitle">后台</p>
        </header>

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

          <el-form-item prop="captchaCode" class="login-form__captcha-item">
            <ClientOnly>
              <BaseTurnstile
                ref="turnstileRef"
                v-model="form.captchaCode"
                :site-key="turnstileSiteKey"
              />
            </ClientOnly>
          </el-form-item>

          <div class="login-form__remember">
            <el-checkbox v-model="form.remember">记住登录状态</el-checkbox>
          </div>

          <button
            type="button"
            class="login-form__submit"
            :disabled="loading"
            @click="onSubmit"
          >
            {{ loading ? '登录中…' : '登录' }}
          </button>
        </el-form>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/stores/admin.store'
import { usePublicSettings } from '@/composables/usePublicSettings'
import { toApiError } from '@/utils/api-error'

definePageMeta({ layout: false })

useHead({
  link: [
    {
      rel: 'preload',
      as: 'script',
      href: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    },
  ],
})

const adminStore = useAdminStore()
const formRef = ref<FormInstance>()
const turnstileRef = ref<{ reset: () => void } | null>(null)
const loading = ref(false)
const { data: publicSettings } = await usePublicSettings()
const turnstileSiteKey = computed(() => String(publicSettings.value?.turnstileSiteKey || ''))

const form = ref({
  account: '',
  password: '',
  captchaCode: '',
  remember: true,
})

const themeSwitch = computed({
  get: () => adminStore.getTheme === 'dark',
  set: (v: boolean) => adminStore.setTheme(v ? 'dark' : 'light'),
})

const rules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请完成人机验证', trigger: 'change' }],
}

const resetTurnstile = () => {
  form.value.captchaCode = ''
  turnstileRef.value?.reset()
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
      '',
      form.value.captchaCode
    )

    if (success) {
      ElMessage.success('登录成功')
      await navigateTo('/admin/content/article', { replace: true })
      return
    }

    ElMessage.error('账号、密码或验证失败')
    resetTurnstile()
  } catch (error: unknown) {
    ElMessage.error(toApiError(error).message || '登录失败，请稍后重试')
    resetTurnstile()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  adminStore.initPreferences()
})
</script>

<style scoped lang="less">
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: @space-5xl @space-3xl;
  overflow: hidden;
  background-color: var(--bg-color);
}

.login-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: @z-raised;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: @header-height;
  padding: 0 @space-4xl;
}

.login-top__home {
  font-size: @font-size-sm;
  color: var(--secondary-color);
  text-decoration: none;
  transition: color @transition-fast ease;

  &:hover {
    color: var(--primary-color);
  }
}

.switch-icon {
  width: 12px;
  height: 12px;
}

.login-card {
  position: relative;
  z-index: @z-base;
  width: min(400px, 100%);
  overflow: hidden;

  &:hover {
    transform: none;
  }

  :deep(.card-content) {
    padding: 0;
  }
}

.login-card__body {
  position: relative;
  z-index: @z-raised;
  padding: @space-5xl @space-4xl @space-4xl;
}

.login-brand {
  text-align: center;
  margin-bottom: @space-4xl;
}

.login-brand__name {
  margin: 0;
  font-size: clamp(26px, 4.5vw, 32px);
  line-height: 1.15;
  letter-spacing: 0.02em;
  color: var(--text-color);
  font-weight: 700;
}

.login-brand__subtitle {
  margin: @space-md 0 0;
  font-size: @font-size-sm;
  color: var(--primary-color);
  letter-spacing: 0.18em;
}

.login-form {
  display: flex;
  flex-direction: column;

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    color: var(--secondary-color);
  }

  :deep(.el-input__wrapper) {
    border-radius: @small-border-radius;
    box-shadow: 0 0 0 1px var(--border-color);
    background-color: color-mix(in srgb, var(--card-color) 88%, transparent);
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

.login-form__captcha-item {
  :deep(.el-form-item__content) {
    display: block;
    line-height: normal;
  }
}

.login-form__remember {
  margin: 0 0 @space-3xl;
  color: var(--secondary-color);
}

.login-form__submit {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: @large-border-radius;
  font-size: 15px;
  color: #fff;
  background: var(--primary-color);
  cursor: pointer;
  transition: background @transition-fast ease;

  &:hover:not(:disabled) {
    background: var(--primary-hover-color);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: @space-4xl @space-2xl;
  }

  .login-top {
    padding: 0 @space-2xl;
  }

  .login-card__body {
    padding: @space-4xl @space-2xl @space-3xl;
  }
}
</style>
