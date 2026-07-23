<template>
  <div class="login-page">
    <div class="login-page__grid" aria-hidden="true"></div>

    <div class="login-card">
      <header class="login-brand">
        <img src="/img/logo.webp" alt="PlankBevelen" class="login-brand__logo" width="56" height="56" />
        <h1 class="login-brand__name">PlankBevelen</h1>
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
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/stores/admin.store'

definePageMeta({ layout: false })

const adminStore = useAdminStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = ref({
  account: '',
  password: '',
  remember: true
})

const rules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const success = await adminStore.login(
      form.value.account,
      form.value.password,
      form.value.remember
    )

    if (success) {
      ElMessage.success('登录成功')
      await navigateTo('/admin', { replace: true })
      return
    }

    ElMessage.error('账号或密码错误')
  } catch (error: any) {
    ElMessage.error(error?.data?.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
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
  z-index: 1;
  width: min(420px, 100%);
  padding: 40px 36px 36px;
  border-radius: 16px;
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
  padding: 8px;
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
  margin: 10px 0 0;
  font-size: 14px;
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
    padding: 4px 12px;

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
    padding: 24px 16px;
  }

  .login-card {
    padding: 32px 22px 28px;
  }
}
</style>
