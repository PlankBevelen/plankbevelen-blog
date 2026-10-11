<template>
  <div class="settings-page">
    <AdminPageHeader title="设置" description="站点常用参数在此维护；保存后热更新。密钥类留空表示不修改。">
      <template #actions>
        <el-button :disabled="saving || loading" @click="load">重新加载</el-button>
        <el-button type="primary" :loading="saving" :disabled="loading" @click="onSave">保存</el-button>
      </template>
    </AdminPageHeader>

    <el-collapse v-model="summaryOpen" class="site-summary">
      <el-collapse-item name="summary">
        <template #title>
          <span class="summary-title">站点摘要</span>
        </template>
        <el-skeleton v-if="infoLoading" animated :rows="2" />
        <div v-else class="summary-grid">
          <div><span>名称</span><strong>{{ siteInfo.siteName }}</strong></div>
          <div><span>地址</span><strong>{{ siteInfo.siteUrl }}</strong></div>
          <div><span>作者</span><strong>{{ siteInfo.siteAuthor }}</strong></div>
          <div><span>语言</span><strong>{{ siteInfo.defaultLocale }}</strong></div>
          <div class="span-2"><span>描述</span><strong>{{ siteInfo.siteDescription }}</strong></div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-skeleton v-if="loading" animated :rows="8" />

    <AdminPanel v-else>
      <el-form :model="form" label-position="top" class="settings-form" @submit.prevent>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="常用" name="common">
            <el-form-item label="管理员账号">
              <el-input v-model="form.adminAccount" maxlength="64" />
            </el-form-item>
            <el-form-item label="新管理员密码（留空不改）">
              <el-input v-model="form.newAdminPassword" type="password" show-password placeholder="至少 8 位" />
              <p class="hint">当前：{{ form.hasAdminPassword ? '已配置' : '未配置' }}</p>
            </el-form-item>
            <el-form-item label="站点 Base URL">
              <el-input v-model="form.baseUrl" />
            </el-form-item>
            <el-form-item label="开放友链申请">
              <el-switch v-model="form.friendLinkApplyEnabled" />
            </el-form-item>
            <p class="group-label">验证码</p>
            <el-form-item label="Turnstile Site Key">
              <el-input v-model="form.turnstileSiteKey" placeholder="0x4AAAA..." />
            </el-form-item>
            <el-form-item label="Turnstile Secret Key（留空不改）">
              <el-input v-model="form.newTurnstileSecretKey" type="password" show-password placeholder="新 Secret" />
              <p class="hint">当前：{{ form.turnstileSecretConfigured ? '已配置' : '未配置' }}</p>
            </el-form-item>
            <p class="group-label">上传</p>
            <div class="grid-2">
              <el-form-item label="单文件最大字节">
                <el-input-number v-model="form.uploadMaxBytes" :min="1024" :max="52428800" :step="1024" class="w-full" />
              </el-form-item>
              <el-form-item label="生产上传目录">
                <el-input v-model="form.uploadDir" placeholder="/var/www/uploads" />
              </el-form-item>
            </div>
          </el-tab-pane>

          <el-tab-pane label="高级" name="advanced">
            <el-collapse v-model="advancedPanels">
              <el-collapse-item title="会话与 Cookie" name="session">
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
              </el-collapse-item>

              <el-collapse-item title="限流与验证码" name="rate">
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
              </el-collapse-item>

              <el-collapse-item title="上传与日志" name="upload">
                <div class="grid-2">
                  <el-form-item label="临时上传保留（小时）">
                    <el-input-number v-model="form.tempUploadTtlHours" :min="1" :max="720" class="w-full" />
                  </el-form-item>
                  <el-form-item label="清理间隔（分钟）">
                    <el-input-number v-model="form.tempCleanIntervalMinutes" :min="5" :max="1440" class="w-full" />
                  </el-form-item>
                  <el-form-item label="访问日志 TTL（天）">
                    <el-input-number v-model="form.visitLogTtlDays" :min="1" :max="3650" class="w-full" />
                  </el-form-item>
                </div>
                <p class="hint">日志 TTL 索引会在下次服务重启时按新值重建。</p>
              </el-collapse-item>

              <el-collapse-item title="Agent 与运维" name="ops">
                <el-form-item label="Agent Chat URL">
                  <el-input v-model="form.agentChatUrl" />
                </el-form-item>
                <el-form-item label="Agent Health URL">
                  <el-input v-model="form.agentHealthUrl" />
                </el-form-item>
                <el-descriptions :column="1" border class="ops-readonly">
                  <el-descriptions-item label="NODE_ENV">{{ form.nodeEnv }}</el-descriptions-item>
                  <el-descriptions-item label="REDIS_URL">
                    {{ form.redisConfigured ? '已配置' : '未配置（进程内内存）' }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </AdminPanel>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import siteService from '@/services/site'
import type { RuntimeSettingsAdminView } from '@/types/data/site'
import type { RuntimeSettingsUpdatePayload } from '@/types/request/site'
import { toApiError } from '@/utils/api-error'

definePageMeta({ middleware: 'auth-middleware', layout: 'admin' })

const loading = ref(true)
const infoLoading = ref(true)
const saving = ref(false)
const activeTab = ref('common')
const advancedPanels = ref(['session'])
const summaryOpen = ref<string[]>([])

const siteInfo = reactive({
  siteName: '—',
  siteUrl: '—',
  siteAuthor: '—',
  defaultLocale: '—',
  siteDescription: '—'
})

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

const loadSiteInfo = async () => {
  infoLoading.value = true
  try {
    const data = await siteService.getInfo()
    Object.assign(siteInfo, {
      siteName: data?.siteName || '—',
      siteUrl: data?.siteUrl || '—',
      siteAuthor: data?.siteAuthor || '—',
      defaultLocale: data?.defaultLocale || '—',
      siteDescription: data?.siteDescription || '—'
    })
  } catch {
    // 摘要失败不阻断设置页
  } finally {
    infoLoading.value = false
  }
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

onMounted(() => {
  load()
  loadSiteInfo()
})
</script>

<style scoped lang="less">
.settings-page {
  .site-summary {
    margin-bottom: @space-2xl;
    border: 1px solid var(--border-color);
    border-radius: @small-border-radius;
    background: var(--card-color);

    :deep(.el-collapse-item__header) {
      height: 44px;
      padding: 0 @space-2xl;
      border-bottom: none;
      background: transparent;
    }

    :deep(.el-collapse-item__wrap) {
      border-top: 1px solid var(--border-color);
      background: transparent;
    }

    :deep(.el-collapse-item__content) {
      padding: @space-2xl;
    }
  }

  .summary-title {
    font-size: @font-size-sm;
    font-weight: 600;
    color: var(--text-color);
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: @space-lg @space-2xl;

    span {
      display: block;
      margin-bottom: 2px;
      font-size: @font-size-xs;
      color: var(--mute-color);
    }

    strong {
      font-size: @font-size-sm;
      font-weight: 500;
      color: var(--text-color);
      word-break: break-all;
    }

    .span-2 {
      grid-column: 1 / -1;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .settings-form {
    width: 100%;
    max-width: 560px;
    margin-inline: auto;
  }

  .group-label {
    margin: @space-lg 0 @space-base;
    font-size: @font-size-xs;
    font-weight: 600;
    color: var(--mute-color);
    letter-spacing: 0.02em;
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
    max-width: 560px;
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .w-full {
    width: 100%;
  }

  .ops-readonly {
    margin-top: @space-xl;
  }
}
</style>
