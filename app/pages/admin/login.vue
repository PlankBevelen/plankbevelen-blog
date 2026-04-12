<template>
  <div class="min-h-screen flex items-center justify-center px-5 py-8 bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="login-shell">
      <section class="brand-panel">
        <img src="/img/logo.webp" alt="logo" class="brand-logo" width="56" height="56" />
        <p class="brand-kicker">PlankBevelen CMS</p>
        <h1 class="brand-title">博客后台管理系统</h1>
        <p class="brand-desc">
          在这里统一完成文章发布、分类维护和内容数据查看，让后台管理更顺手。
        </p>

        <ul class="brand-points">
          <li>快速发布和编辑 Markdown 文章</li>
          <li>集中管理分类、标签与内容结构</li>
          <li>通过仪表盘追踪内容产出趋势</li>
        </ul>
      </section>

      <section class="login-panel">
        <div class="login-header">
          <h2 class="login-title">账号登录</h2>
          <p class="login-subtitle">请输入管理员账号和密码继续操作</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="form"
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

          <div class="remember-row">
            <el-checkbox v-model="form.remember">记住登录状态</el-checkbox>
          </div>

          <el-button
            type="primary"
            class="submit-btn"
            size="large"
            :loading="loading"
            @click="onSubmit"
          >
            登录后台
          </el-button>
        </el-form>
      </section>
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
      navigateTo('/admin', { replace: true })
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background:
    radial-gradient(circle at top left, rgba(0, 105, 217, 0.12), transparent 34%),
    radial-gradient(circle at bottom right, rgba(25, 135, 84, 0.12), transparent 28%),
    linear-gradient(135deg, #f6f8fb 0%, #eef3f8 100%);
}

.login-shell {
  width: min(1080px, 100%);
  display: grid;
  grid-template-columns: minmax(320px, 1.05fr) minmax(320px, 0.95fr);
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 28px 80px rgba(16, 24, 40, 0.12);
  backdrop-filter: blur(18px);
}

.brand-panel {
  padding: 56px;
  color: #0f172a;
  background:
    linear-gradient(145deg, rgba(0, 105, 217, 0.08), rgba(25, 135, 84, 0.06)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.92));
}

.brand-logo {
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 105, 217, 0.16);
}

.brand-kicker {
  margin: 24px 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0069d9;
}

.brand-title {
  margin: 0;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.1;
  font-weight: 800;
}

.brand-desc {
  margin: 18px 0 0;
  max-width: 420px;
  font-size: 15px;
  line-height: 1.8;
  color: #475467;
}

.brand-points {
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #0f172a;

    &::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: linear-gradient(135deg, #0069d9, #198754);
      box-shadow: 0 0 0 6px rgba(0, 105, 217, 0.08);
    }
  }
}

.login-panel {
  padding: 56px 44px;
  background-color: var(--card-color);
}

.login-header {
  margin-bottom: 28px;
}

.login-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
}

.login-subtitle {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--tertiary-color);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 4px;

  :deep(.el-form-item) {
    margin-bottom: 18px;
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

.remember-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  color: var(--secondary-color);
}

.submit-btn {
  width: 100%;
  border-radius: @base-border-radius;
  height: 46px;
  font-size: @font-size-md;
  font-weight: 600;
  letter-spacing: 1px;
}

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel,
  .login-panel {
    padding: 36px 28px;
  }
}
</style>
