<template>
  <div class="friends">
    <div class="container">
      <LayoutTwoColumn :loading="pending || sidebarPending">
        <template #left>
          <WidgetBlogger
            :articleCount="stats?.articles || 0"
            :categoryCount="stats?.categories || 0"
            :tagCount="stats?.tags || 0"
          />
          <WidgetRecordLink />
        </template>

        <template #right>
          <BaseCard type="friend-myself">
            <template #header>{{ $t('friends.myself.title') }}</template>
            <div class="myself">
              <img
                v-if="selfInfo.avatar && !selfAvatarError"
                class="myself-avatar"
                :src="selfInfo.avatar"
                alt="plankbevelen"
                loading="lazy"
                @error="selfAvatarError = true"
              />
              <span v-else class="myself-avatar myself-avatar-fallback">{{ (selfInfo.name || '?').charAt(0).toUpperCase() }}</span>
              <div class="myself-info">
                <div class="myself-row">
                  <span class="myself-label">{{ $t('friends.myself.name') }}</span>
                  <span class="myself-value">{{ selfInfo.name }}</span>
                </div>
                <div class="myself-row">
                  <span class="myself-label">{{ $t('friends.myself.url') }}</span>
                  <a class="myself-value myself-link" :href="selfInfo.url" target="_blank" rel="noopener noreferrer">{{ selfInfo.url }}</a>
                </div>
                <div class="myself-row">
                  <span class="myself-label">{{ $t('friends.myself.desc') }}</span>
                  <span class="myself-value">{{ selfInfo.description }}</span>
                </div>
              </div>
              <div class="myself-actions">
                <el-button type="primary" size="small" @click="openApply">{{ $t('friends.apply') }}</el-button>
                <el-button type="primary" plain size="small" @click="copyMyself">{{ $t('friends.myself.copy') }}</el-button>
              </div>
            </div>
          </BaseCard>

          <p v-if="!pending && friends.length === 0" class="friends-empty">{{ $t('friends.empty') }}</p>

          <div class="friends-grid">
            <a
              v-for="item in friends"
              :key="item.id"
              class="friend-card"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              <div class="friend-avatar">
                <img
                  v-if="item.avatar && !avatarError[item.id]"
                  :src="item.avatar"
                  :alt="item.name"
                  loading="lazy"
                  @error="setAvatarError(item.id)"
                />
                <span v-else class="friend-avatar-fallback">{{ (item.name || '?').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="friend-info">
                <span class="friend-name">{{ item.name }}</span>
                <span class="friend-desc">{{ item.description }}</span>
              </div>
            </a>
          </div>

          <BaseCard type="friend-notice">
            <template #header>{{ $t('friends.notice.title') }}</template>
            <ul class="notice-list">
              <li v-for="item in noticeItems" :key="item" class="notice-item">{{ item }}</li>
            </ul>
          </BaseCard>
        </template>
      </LayoutTwoColumn>
    </div>

    <el-dialog v-model="applyVisible" :title="$t('friends.applyTitle')" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item :label="$t('friends.form.name')" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('friends.form.url')" prop="url">
          <el-input v-model="form.url" placeholder="https://" />
        </el-form-item>
        <el-form-item :label="$t('friends.form.description')" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('friends.form.avatar')" prop="avatar">
          <el-input v-model="form.avatar" placeholder="https://（可选）" />
        </el-form-item>
        <el-form-item :label="$t('friends.form.captcha')" prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" />
            <div class="captcha-img" @click="refreshCaptcha" title="点击刷新验证码">
              <img v-if="captchaSrc" :src="captchaSrc" alt="验证码" />
              <span v-else class="captcha-placeholder">点击加载</span>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyVisible = false">{{ $t('friends.form.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">{{ $t('friends.form.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useSidebarData } from '@/composables/useSidebarData'
import { SITE_URL, SITE_IMAGE } from '@/composables/useSeo'
import friendLinkService from '@/services/friend-link.service'
import type { FriendLink } from '@/types/friend-link'

const { t } = useI18n()

const { data, pending } = await useAsyncData('friend-links', async () => {
  const res = await friendLinkService.getPublic()
  return res.data || []
})
const friends = computed<FriendLink[]>(() => data.value || [])

const { data: sidebarData, pending: sidebarPending } = await useSidebarData()
const stats = computed(() => sidebarData.value?.stats || null)

const { data: selfData } = await useAsyncData('friend-link-self', async () => {
  const res = await friendLinkService.getSelf()
  return res.data || null
})
const selfInfo = computed(() => selfData.value || {
  name: t('site.name'),
  url: SITE_URL,
  description: t('site.description'),
  avatar: SITE_IMAGE
})

const noticeItems = computed(() => [
  t('friends.notice.item1'),
  t('friends.notice.item2'),
  t('friends.notice.item3'),
  t('friends.notice.item4')
])

const friendCopyText = computed(() => `- [${selfInfo.value.name}](${selfInfo.value.url}) · ${selfInfo.value.description}`)

const copyMyself = async () => {
  try {
    await navigator.clipboard.writeText(friendCopyText.value)
    ElMessage.success(t('friends.myself.copied'))
  } catch {
    ElMessage.error(t('friends.submitFailed'))
  }
}

const applyVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const captchaId = ref('')
const captchaImage = ref('')
const avatarError = reactive<Record<string, boolean>>({})
const selfAvatarError = ref(false)

const form = reactive({ name: '', url: '', description: '', avatar: '', captchaCode: '' })

const captchaSrc = computed(() =>
  captchaImage.value ? `data:image/svg+xml;utf8,${encodeURIComponent(captchaImage.value)}` : ''
)

const httpUrlValidator = (_rule: any, value: string, cb: any) => {
  if (!value) return cb()
  try {
    const u = new URL(value)
    if (u.protocol === 'http:' || u.protocol === 'https:') return cb()
  } catch {
    /* ignore */
  }
  cb(new Error(t('friends.form.invalidUrl')))
}

const rules: FormRules = {
  name: [{ required: true, message: t('friends.rules.name'), trigger: 'blur' }],
  url: [
    { required: true, message: t('friends.rules.url'), trigger: 'blur' },
    { validator: httpUrlValidator, trigger: 'blur' }
  ],
  avatar: [{ validator: httpUrlValidator, trigger: 'blur' }],
  captchaCode: [{ required: true, message: t('friends.rules.captcha'), trigger: 'blur' }]
}

const refreshCaptcha = async () => {
  try {
    const res: any = await friendLinkService.captcha()
    if (res?.status === 200 && res?.captchaId) {
      captchaId.value = res.captchaId
      captchaImage.value = res.image || ''
    } else {
      captchaImage.value = ''
    }
  } catch {
    captchaImage.value = ''
  } finally {
    form.captchaCode = ''
  }
}

const setAvatarError = (id: string) => {
  avatarError[id] = true
}

const openApply = () => {
  form.name = ''
  form.url = ''
  form.description = ''
  form.avatar = ''
  form.captchaCode = ''
  applyVisible.value = true
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await friendLinkService.submit({
      name: form.name,
      url: form.url,
      description: form.description,
      avatar: form.avatar,
      captchaId: captchaId.value,
      captchaCode: form.captchaCode
    })
    if (res.status === 200) {
      ElMessage.success(t('friends.submitSuccess'))
      applyVisible.value = false
    } else {
      ElMessage.error(res.msg || t('friends.submitFailed'))
      await refreshCaptcha()
    }
  } catch (error: any) {
    ElMessage.error(error?.data?.msg || error?.message || t('friends.submitFailed'))
    await refreshCaptcha()
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="less" scoped>
.friends {
  min-height: 100vh;
  padding-top: @header-height;

  .container {
    padding-top: @space-5xl;
    padding-bottom: @space-5xl;
  }
}

.friends-empty {
  color: var(--tertiary-color);
  font-size: @font-size-sm;
  padding: @space-4xl 0;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: @space-base;

  .notice-item {
    position: relative;
    padding-left: @space-2xl;
    font-size: @font-size-sm;
    color: var(--secondary-color);
    line-height: 1.6;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.55em;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--primary-color);
    }
  }
}

.myself {
  display: flex;
  flex-direction: column;
  gap: @space-lg;

  .myself-avatar {
    width: 56px;
    height: 56px;
    border-radius: @large-border-radius;
    object-fit: cover;
  }

  .myself-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: @font-size-xl;
    font-weight: 600;
    color: var(--primary-color);
    background-color: var(--mute-bg-color);
  }

  .myself-info {
    display: flex;
    flex-direction: column;
    gap: @space-base;

    .myself-row {
      display: flex;
      gap: @space-lg;
      align-items: baseline;

      .myself-label {
        flex-shrink: 0;
        width: 48px;
        font-size: @font-size-xs;
        color: var(--tertiary-color);
      }

      .myself-value {
        font-size: @font-size-sm;
        color: var(--text-color);
        word-break: break-all;
      }

      .myself-link {
        color: var(--primary-color);
        text-decoration: none;

        &:hover {
          color: var(--primary-hover-color);
        }
      }
    }
  }

  .myself-actions {
    display: flex;
    gap: @space-lg;
  }
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: @space-2xl;
}

.friend-card {
  display: flex;
  align-items: center;
  gap: @space-lg;
  padding: @space-2xl;
  border-radius: @base-border-radius;
  background-color: var(--card-color);
  border: 1px solid var(--border-color);
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--primary-color);
    box-shadow: @shadow-card;
  }
}

.friend-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: @large-border-radius;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--mute-bg-color);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .friend-avatar-fallback {
    font-size: @font-size-xl;
    font-weight: 600;
    color: var(--primary-color);
  }
}

.friend-info {
  display: flex;
  flex-direction: column;
  gap: @space-2xs;
  min-width: 0;

  .friend-name {
    font-size: @font-size-md;
    font-weight: 500;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .friend-desc {
    font-size: @font-size-xs;
    color: var(--tertiary-color);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.captcha-row {
  display: flex;
  gap: @space-lg;
  align-items: center;
  width: 100%;

  :deep(.el-input) {
    flex: 1;
  }
}

.captcha-img {
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
</style>
