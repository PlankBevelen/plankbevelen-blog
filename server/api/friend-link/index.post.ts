import { defineEventHandler, readBody, setResponseStatus, getRequestIP } from 'h3'
import { withTransaction, getCollections, getNextSequence } from '../../utils/mongo'
import { validateFriendLinkInput, normalizeUrl } from '../../utils/friend-links'
import { verifyTurnstileToken } from '../../modules/captcha/turnstile'
import { assertRateLimit } from '../../utils/rate-limit'
import { getRuntimeSettings } from '../../core/runtime-settings'

export default defineEventHandler(async (event) => {
  const settings = await getRuntimeSettings()
  if (!settings.friendLinkApplyEnabled) {
    setResponseStatus(event, 403)
    return { status: 403, msg: '当前未开放友链申请', data: null }
  }

  const max = settings.friendLinkSubmitRateLimitMax || Number(process.env.FRIEND_LINK_SUBMIT_RATE_LIMIT_MAX) || 3
  const windowSec =
    settings.friendLinkSubmitRateLimitWindowSeconds ||
    Number(process.env.FRIEND_LINK_SUBMIT_RATE_LIMIT_WINDOW_SECONDS) ||
    3600
  if (!(await assertRateLimit(event, 'friend-link-submit', max, windowSec))) {
    setResponseStatus(event, 429)
    return { status: 429, msg: '提交过于频繁，请稍后再试', data: null }
  }

  try {
    const body = await readBody<{
      name?: string
      url?: string
      description?: string
      avatar?: string
      turnstileToken?: string
    }>(event)

    const remoteIp = getRequestIP(event, { xForwardedFor: false }) || ''
    const turnstileOk = await verifyTurnstileToken(body?.turnstileToken || '', remoteIp)
    if (!turnstileOk) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '请完成人机验证', data: null }
    }

    // 字段校验 + 清洗
    const v = validateFriendLinkInput(body || {})
    if (!v.ok) {
      setResponseStatus(event, 400)
      return { status: 400, msg: v.msg, data: null }
    }
    const { name, url, description, avatar } = v.value
    const normalizedUrl = normalizeUrl(url)
    const submitterIp = getRequestIP(event, { xForwardedFor: false }) || ''

    const data = await withTransaction(async (ctx) => {
      const { friendLinks } = getCollections(ctx.db)

      // 查重：同 normalizedUrl 的未软删记录（任意状态）
      const existing = await friendLinks.findOne(
        { normalizedUrl, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (existing) throw new Error('DUPLICATE')

      const id = await getNextSequence('friend_links', ctx)
      const now = new Date()
      await friendLinks.insertOne(
        { id, name, url, normalizedUrl, description, avatar, status: 'pending', submitterIp, createdAt: now, updatedAt: now },
        ctx.session ? { session: ctx.session } : undefined
      )
      return { id: String(id), name, url, description, avatar, status: 'pending' }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '提交成功，等待审核', data }
  } catch (error: any) {
    if (String(error?.message).includes('DUPLICATE')) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '该站点已申请或已存在', data: null }
    }
    console.error('提交友链申请失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
