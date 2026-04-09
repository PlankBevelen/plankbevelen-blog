<template>
  <div class="h-full w-full flex items-center justify-center bg-[--bg-color]">
    <div class="login-box">
      <div class="login-header">
        <img src="/img/logo.webp" alt="logo" class="logo" width="48" height="48" />
        <h1 class="title">PlankBevelen</h1>
        <p class="subtitle">后台管理系统</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="form"
        @keyup.enter="onSubmit"
      >
        <el-form-item prop="account">
          <el-input
            v-model="form.account"
            placeholder="账号"
            size="large"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
          />
        </el-form-item>
        <div class="remember-row">
          <el-checkbox v-model="form.remember">记住我</el-checkbox>
        </div>
        <el-button
          type="primary"
          class="submit-btn"
          size="large"
          :loading="loading"
          @click="onSubmit"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useAdminStore } from '@/stores/admin.store'

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = ref({ account: '', password: '', remember: true })
const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const success = await useAdminStore().login(
      form.value.account,
      form.value.password,
      form.value.remember
    )
    if (success) {
      navigateTo('/admin', { replace: true })
    } else {
      ElMessage.error('账号或密码错误')
    }
  } catch (e: any) {
    ElMessage.error(e?.data?.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-box {
  width: 380px;
  padding: 48px 40px;
  background-color: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: @base-border-radius;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;

  .logo {
    display: block;
    margin: 0 auto 16px;
    border-radius: @small-border-radius;
    object-fit: cover;
  }

  .title {
    font-size: @font-size-xxl;
    font-weight: 700;
    color: var(--text-color);
    line-height: normal;
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: @font-size-sm;
    color: var(--tertiary-color);
    line-height: normal;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 4px;

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-input__wrapper) {
    border-radius: @base-border-radius;
    box-shadow: 0 0 0 1px var(--border-color);
    background-color: transparent;
    padding: 4px 12px;

    &:hover {
      box-shadow: 0 0 0 1px var(--primary-color);
    }

    &.is-focus {
      box-shadow: 0 0 0 1px var(--primary-color);
    }
  }

  :deep(.el-input__inner) {
    background: transparent;
    height: 36px;
  }
}

.remember-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  border-radius: @base-border-radius;
  height: 44px;
  font-size: @font-size-md;
  font-weight: 500;
  letter-spacing: 2px;
}
</style>