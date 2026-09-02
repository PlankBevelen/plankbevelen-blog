import { defineEventHandler, readBody, setResponseStatus, getRequestIP } from 'h3'
import { withTransaction, getCollections, getNextSequence } from '../../utils/mongo'
import { validateFriendLinkInput, normalizeUrl } from '../../utils/friend-links'
import { consumeCaptcha } from '../../utils/captcha'
import { assertRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  // 限流（每 IP）
  const max = Number(process.env.FRIEND_LINK_SUBMIT_RATE_LIMIT_MAX) || 3
  const windowSec = Number(process.env.FRIEND_LINK_SUBMIT_RATE_LIMIT_WINDOW_SECONDS) || 3600
  if (!(await assertRateLimit(event, 'friend-link-submit', max, windowSec))) {
    return { status: 429, msg: '提交过于频繁，请稍后再试' }
  }

  try {
    const body = await readBody<{
      name?: string
      url?: string
      description?: string
      avatar?: string
      captchaId?: string
      captchaCode?: string
    }>(event)

    // 单次验证码校验
    const captchaOk = await consumeCaptcha(body?.captchaId || '', body?.captchaCode || '')
    if (!captchaOk) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '验证码错误或已过期', data: null }
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
