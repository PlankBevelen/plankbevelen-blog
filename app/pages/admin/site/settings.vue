<template>
  <div class="settings-page">
    <div class="header">
      <h2 class="title">系统配置</h2>
      <p class="desc">业务参数统一在此维护，保存后热更新（无需改服务器 .env / 重新部署）。密钥类留空表示不修改。</p>
    </div>

    <el-skeleton v-if="loading" animated :rows="8" />

    <el-form v-else ref="formRef" :model="form" label-position="top" class="settings-form" @submit.prevent>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="安全与会话" name="security">
          <el-form-item label="管理员账号">
            <el-input v-model="form.adminAccount" maxlength="64" />
          </el-form-item>
          <el-form-item label="新管理员密码（留空不改）">
            <el-input v-model="form.newAdminPassword" type="password" show-password placeholder="至少 8 位" />
            <p class="hint">当前：{{ form.hasAdminPassword ? '已配置' : '未配置' }}</p>
          </el-form-item>
          <el-form-item label="新认证密钥 authSecret（留空不改）">
            <el-input v-model="form.newAuthSecret" type="password" show-password placeholder="至少 16 位，轮换会使现有会话失效" />
            <p class="hint">当前：{{ form.authSecretConfigured ? form.authSecretMasked : '未配置' }}</p>
          </el-form-item>
          <div class="grid-2">
            <el-form-item label="记住登录有效期（秒）">
              <el-input-number v-model="form.sessionExpirationSeconds" :min="300" :max="2592000" class="w-full" />
            </el-form-item>
            <el-form-item label="普通会话有效期（秒）">
              <el-input-number v-model="form.sessionKeepAliveSeconds" :min="300" :max="2592000" class="w-full" />
            </el-form-item>
          </div>
          <el-form-item label="Cookie 前缀">
            <el-input v-model="form.cookiePrefix" maxlength="64" />
          </el-form-item>
          <el-form-item label="Cookie Secure">
            <el-select v-model="form.cookieSecure" class="w-full">
              <el-option label="自动（生产开启）" value="auto" />
              <el-option label="强制开启" value="force_on" />
              <el-option label="强制关闭" value="force_off" />
            </el-select>
          </el-form-item>
          <el-form-item label="信任反向代理">
            <el-switch v-model="form.trustProxy" />
          </el-form-item>
          <el-form-item label="可信代理 IP（逗号分隔）">
            <el-input v-model="form.trustedProxyIps" placeholder="127.0.0.1,10.0.0.1" />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="限流与验证码" name="rate">
          <el-form-item label="Turnstile Site Key">
            <el-input v-model="form.turnstileSiteKey" placeholder="0x4AAAA..." />
          </el-form-item>
          <el-form-item label="Turnstile Secret Key（留空不改）">
            <el-input v-model="form.newTurnstileSecretKey" type="password" show-password placeholder="新 Secret" />
            <p class="hint">当前：{{ form.turnstileSecretConfigured ? '已配置' : '未配置' }}</p>
          </el-form-item>
          <div class="grid-2">
            <el-form-item label="登录限流次数">
              <el-input-number v-model="form.loginRateLimitMax" :min="1" :max="1000" class="w-full" />
            </el-form-item>
            <el-form-item label="登录限流窗口（秒）">
              <el-input-number v-model="form.loginRateLimitWindowSeconds" :min="1" :max="86400" class="w-full" />
            </el-form-item>
            <el-form-item label="验证码限流次数">
              <el-input-number v-model="form.captchaRateLimitMax" :min="1" :max="1000" class="w-full" />
            </el-form-item>
            <el-form-item label="验证码限流窗口（秒）">
              <el-input-number v-model="form.captchaRateLimitWindowSeconds" :min="1" :max="86400" class="w-full" />
            </el-form-item>
            <el-form-item label="验证码有效期（秒）">
              <el-input-number v-model="form.captchaTtlSeconds" :min="30" :max="3600" class="w-full" />
            </el-form-item>
            <el-form-item label="滑动容差（像素）">
              <el-input-number v-model="form.captchaSlideTolerance" :min="1" :max="30" class="w-full" />
            </el-form-item>
            <el-form-item label="友链提交限流次数">
              <el-input-number v-model="form.friendLinkSubmitRateLimitMax" :min="1" :max="100" class="w-full" />
            </el-form-item>
            <el-form-item label="友链提交窗口（秒）">
              <el-input-number v-model="form.friendLinkSubmitRateLimitWindowSeconds" :min="60" :max="604800" class="w-full" />
            </el-form-item>
          </div>
        </el-tab-pane>

        <el-tab-pane label="上传" name="upload">
          <el-form-item label="单文件最大字节">
            <el-input-number v-model="form.uploadMaxBytes" :min="1024" :max="52428800" :step="1024" class="w-full" />
          </el-form-item>
          <el-form-item label="生产上传目录（空则默认 /var/www/uploads）">
            <el-input v-model="form.uploadDir" placeholder="/var/www/uploads" />
          </el-form-item>
          <div class="grid-2">
            <el-form-item label="临时上传保留（小时）">
              <el-input-number v-model="form.tempUploadTtlHours" :min="1" :max="720" class="w-full" />
            </el-form-item>
            <el-form-item label="清理间隔（分钟）">
              <el-input-number v-model="form.tempCleanIntervalMinutes" :min="5" :max="1440" class="w-full" />
            </el-form-item>
          </div>
        </el-tab-pane>

        <el-tab-pane label="站点与功能" name="site">
          <el-form-item label="站点 Base URL">
            <el-input v-model="form.baseUrl" />
          </el-form-item>
          <el-form-item label="开放友链申请">
            <el-switch v-model="form.friendLinkApplyEnabled" />
          </el-form-item>
          <el-form-item label="Agent Chat URL">
            <el-input v-model="form.agentChatUrl" />
          </el-form-item>
          <el-form-item label="Agent Health URL">
            <el-input v-model="form.agentHealthUrl" />
          </el-form-item>
          <el-form-item label="访问日志 TTL（天）">
            <el-input-number v-model="form.visitLogTtlDays" :min="1" :max="3650" class="w-full" />
            <p class="hint">索引会在下次服务重启时按新值重建。</p>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="运维只读" name="ops">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="NODE_ENV">{{ form.nodeEnv }}</el-descriptions-item>
            <el-descriptions-item label="REDIS_URL">{{ form.redisConfigured ? '已配置' : '未配置（进程内内存）' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>

      <div class="actions">
        <el-button type="primary" :loading="saving" @click="onSave">保存配置</el-button>
        <el-button :disabled="saving" @click="load">重新加载</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import siteService from '@/services/site'
import type { RuntimeSettingsAdminView } from '@/types/data/site'
import type { RuntimeSettingsUpdatePayload } from '@/types/request/site'
import { toApiError } from '@/utils/http'

definePageMeta({ layout: 'admin' })

const loading = ref(true)
const saving = ref(false)
const activeTab = ref('security')

const form = reactive({
  adminAccount: '',
  newAdminPassword: '',
  newAuthSecret: '',
  hasAdminPassword: false,
  authSecretConfigured: false,
  authSecretMasked: '',
  sessionExpirationSeconds: 43200,
  sessionKeepAliveSeconds: 604800,
  cookiePrefix: 'plankbevelen_',
  cookieSecure: 'auto' as 'auto' | 'force_on' | 'force_off',
  trustProxy: false,
  trustedProxyIps: '',
  loginRateLimitMax: 10,
  loginRateLimitWindowSeconds: 60,
  captchaRateLimitMax: 20,
  captchaRateLimitWindowSeconds: 60,
  captchaTtlSeconds: 300,
  captchaSlideTolerance: 5,
  friendLinkSubmitRateLimitMax: 3,
  friendLinkSubmitRateLimitWindowSeconds: 3600,
  friendLinkApplyEnabled: true,
  uploadMaxBytes: 5242880,
  uploadDir: '',
  tempUploadTtlHours: 48,
  tempCleanIntervalMinutes: 60,
  baseUrl: '/',
  agentChatUrl: '',
  agentHealthUrl: '',
  visitLogTtlDays: 180,
  turnstileSiteKey: '',
  newTurnstileSecretKey: '',
  turnstileSecretConfigured: false,
  redisConfigured: false,
  nodeEnv: '',
})

const applyData = (data: RuntimeSettingsAdminView | null | undefined) => {
  if (!data) return
  Object.assign(form, {
    ...data,
    newAdminPassword: '',
    newAuthSecret: '',
    newTurnstileSecretKey: '',
  })
}

const load = async () => {
  loading.value = true
  try {
    applyData(await siteService.getRuntimeSettings())
  } catch (e: unknown) {
    ElMessage.error(toApiError(e).message || '加载失败')
  } finally {
    loading.value = false
  }
}

const onSave = async () => {
  if (form.newAdminPassword || form.newAuthSecret) {
    const ok = await ElMessageBox.confirm(
      form.newAuthSecret
        ? '将更新认证密钥，现有后台会话会失效，确认继续？'
        : '将更新管理员密码，确认继续？',
      '确认保存',
      { type: 'warning', confirmButtonText: '保存', cancelButtonText: '取消' }
    ).then(() => true).catch(() => false)
    if (!ok) return
  }

  saving.value = true
  try {
    const payload: RuntimeSettingsUpdatePayload = {
      adminAccount: form.adminAccount,
      sessionExpirationSeconds: form.sessionExpirationSeconds,
      sessionKeepAliveSeconds: form.sessionKeepAliveSeconds,
      cookiePrefix: form.cookiePrefix,
      cookieSecure: form.cookieSecure,
      trustProxy: form.trustProxy,
      trustedProxyIps: form.trustedProxyIps,
      loginRateLimitMax: form.loginRateLimitMax,
      loginRateLimitWindowSeconds: form.loginRateLimitWindowSeconds,
      captchaRateLimitMax: form.captchaRateLimitMax,
      captchaRateLimitWindowSeconds: form.captchaRateLimitWindowSeconds,
      captchaTtlSeconds: form.captchaTtlSeconds,
      captchaSlideTolerance: form.captchaSlideTolerance,
      friendLinkSubmitRateLimitMax: form.friendLinkSubmitRateLimitMax,
      friendLinkSubmitRateLimitWindowSeconds: form.friendLinkSubmitRateLimitWindowSeconds,
      friendLinkApplyEnabled: form.friendLinkApplyEnabled,
      uploadMaxBytes: form.uploadMaxBytes,
      uploadDir: form.uploadDir,
      tempUploadTtlHours: form.tempUploadTtlHours,
      tempCleanIntervalMinutes: form.tempCleanIntervalMinutes,
      baseUrl: form.baseUrl,
      agentChatUrl: form.agentChatUrl,
      agentHealthUrl: form.agentHealthUrl,
      visitLogTtlDays: form.visitLogTtlDays,
      turnstileSiteKey: form.turnstileSiteKey,
    }
    if (form.newAdminPassword) payload.newAdminPassword = form.newAdminPassword
    if (form.newAuthSecret) payload.newAuthSecret = form.newAuthSecret
    if (form.newTurnstileSecretKey) payload.newTurnstileSecretKey = form.newTurnstileSecretKey

    const data = await siteService.updateRuntimeSettings(payload)
    ElMessage.success('保存成功')
    applyData(data)
  } catch (e: unknown) {
    ElMessage.error(toApiError(e).message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="less">
.settings-page {
  .header {
    margin-bottom: @space-3xl;
  }
  .title {
    margin: 0;
    font-size: @font-size-xl;
    color: var(--text-color);
  }
  .desc {
    margin: @space-sm 0 0;
    font-size: @font-size-sm;
    color: var(--secondary-color);
  }
  .hint {
    margin: @space-2xs 0 0;
    font-size: @font-size-xs;
    color: var(--tertiary-color);
  }
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 @space-2xl;
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  .w-full {
    width: 100%;
  }
  .actions {
    margin-top: @space-3xl;
    display: flex;
    gap: @space-lg;
  }
}
</style>
