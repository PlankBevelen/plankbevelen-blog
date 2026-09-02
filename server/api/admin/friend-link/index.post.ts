import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { withTransaction, getCollections, getNextSequence } from '../../../utils/mongo'
import { validateFriendLinkInput, normalizeUrl } from '../../../utils/friend-links'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ name?: string; url?: string; description?: string; avatar?: string }>(event)

    const v = validateFriendLinkInput(body || {})
    if (!v.ok) {
      setResponseStatus(event, 400)
      return { status: 400, msg: v.msg, data: null }
    }
    const { name, url, description, avatar } = v.value
    const normalizedUrl = normalizeUrl(url)

    const data = await withTransaction(async (ctx) => {
      const { friendLinks } = getCollections(ctx.db)

      const existing = await friendLinks.findOne(
        { normalizedUrl, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (existing) throw new Error('DUPLICATE')

      const id = await getNextSequence('friend_links', ctx)
      const now = new Date()
      await friendLinks.insertOne(
        { id, name, url, normalizedUrl, description, avatar, status: 'approved', createdAt: now, updatedAt: now },
        ctx.session ? { session: ctx.session } : undefined
      )
      return { id: String(id), name, url, description, avatar, status: 'approved' }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '新增成功', data }
  } catch (error: any) {
    if (String(error?.message).includes('DUPLICATE')) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '该站点已存在', data: null }
    }
    console.error('新增友链失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
