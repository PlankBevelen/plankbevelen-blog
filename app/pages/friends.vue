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
              <div class="myself-body">
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
            </div>
          </BaseCard>

          <p v-if="!pending && friends.length === 0" class="friends-empty">{{ $t('friends.empty') }}</p>

          <div class="friends-grid">
            <BaseCard
              v-for="item in friends"
              :key="item.id"
              tag="a"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer nofollow"
              class="friend-card"
            >
              <div class="friend-card-inner">
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
              </div>
            </BaseCard>
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
            <el-input v-model="form.captchaCode" maxlength="6" />
            <button
              type="button"
              class="captcha-img"
              :title="$t('friends.form.captchaRefresh')"
              :aria-label="$t('friends.form.captchaRefresh')"
              @click="refreshCaptcha"
            >
              <img v-if="captchaSrc" :src="captchaSrc" :alt="$t('friends.form.captcha')" />
              <span v-else class="captcha-placeholder">···</span>
            </button>
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

const friendCopyText = computed(() => `- [${selfInfo.value.name}](${selfInfo.value.url}) · ${selfInfo.value.description} · ![avatar](${selfInfo.value.avatar})`)

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
  // 打开就把验证码取好，不让用户先看到一个「点击加载」的空位。
  // 不 await：弹窗先出来，验证码图片自己填进去
  refreshCaptcha()
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
  flex-direction: row;
  gap: @space-2xl;

  .myself-avatar {
    flex-shrink: 0;
    width: 72px;
    height: 72px;
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

  .myself-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: @space-lg;
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

// 固定列数而不是 auto-fill：auto-fill 的列数由容器宽度除以 minmax 下限算出来，
// 容器一变宽卡片就跟着变宽，宽度不可控。这里 5 列起，逐档降到最少 3 列。
//
// minmax(0, 1fr) 而不是 1fr：1fr 的下限是 auto，网格列会被卡片里
// 不可压缩的内容（长名字、长描述）撑开，导致列宽不等。0 才真正等分。
.friends-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: @space-lg;
}

@media (max-width: @screen-xl) {
  .friends-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: @screen-md) {
  .friends-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: @space-base;
  }
}

.friend-card {
  text-decoration: none;
}

// 5 列下每张卡片约 145px，减去内边距只剩 110px 出头，
// 横向「头像 + 文字」排不开，所以改成纵向居中堆叠。
.friend-card :deep(.card-content) {
  padding: @space-2xl @space-lg;
}

.friend-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: @space-base;
  min-width: 0;
}

.friend-avatar {
  flex-shrink: 0;
  // 跟着卡片宽度收放：窄屏 3 列时卡片只有 100px 出头，48px 头像会顶满
  width: clamp(36px, 32%, 48px);
  aspect-ratio: 1 / 1;
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
    font-size: @font-size-lg;
    font-weight: 600;
    color: var(--primary-color);
  }
}

.friend-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: @space-2xs;
  min-width: 0;
  width: 100%;
  text-align: center;

  .friend-name {
    max-width: 100%;
    font-size: @font-size-sm;
    font-weight: 500;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // 两行截断 + 固定高度：卡片高度由最长的描述决定，
  // 钉住 2 行的高度后所有卡片一样高，网格不会参差
  .friend-desc {
    font-size: @font-size-2xs;
    line-height: 1.5;
    height: 2 * 1.5em;
    color: var(--tertiary-color);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
}

// align-items: stretch 而不是 center：验证码盒子高度跟着 el-input 长，
// 不再写死 40px。原来写死的值和 Element Plus default 尺寸的 32px 差 8px，
// 两个控件就错开了；改成 stretch 后不管全局尺寸怎么变都对齐。
.captcha-row {
  display: flex;
  align-items: stretch;
  gap: @space-lg;
  width: 100%;

  :deep(.el-input) {
    flex: 1;
    min-width: 0;
  }
}

.captcha-img {
  flex-shrink: 0;
  width: 110px;
  padding: 0;
  border: 1px solid var(--el-input-border-color, var(--border-color));
  border-radius: var(--el-input-border-radius, @base-border-radius);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  transition: border-color @transition-fast ease-in-out;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .captcha-placeholder {
    font-size: @font-size-sm;
    letter-spacing: 0.2em;
    color: var(--tertiary-color);
  }

  &:hover {
    border-color: var(--primary-color);
  }

  // reset.less 全局清了 outline，键盘焦点必须自己补回来
  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}
</style>
