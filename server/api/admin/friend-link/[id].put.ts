import { defineEventHandler, readBody, setResponseStatus } from 'h3'
import { withTransaction, getCollections } from '../../../utils/mongo'
import { validateFriendLinkInput, normalizeUrl } from '../../../utils/friend-links'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event?.context?.params?.id)
    const body = await readBody<{ name?: string; url?: string; description?: string; avatar?: string; status?: string }>(event)
    if (!id) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '参数错误', data: null }
    }

    const v = validateFriendLinkInput(body || {})
    if (!v.ok) {
      setResponseStatus(event, 400)
      return { status: 400, msg: v.msg, data: null }
    }
    const { name, url, description, avatar } = v.value
    const normalizedUrl = normalizeUrl(url)
    const nextStatus = ['pending', 'approved', 'rejected'].includes(String(body?.status)) ? String(body?.status) : undefined

    const data = await withTransaction(async (ctx) => {
      const { friendLinks } = getCollections(ctx.db)
      const old: any = await friendLinks.findOne(
        { id, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (!old) throw new Error('NOT_FOUND')

      const existing = await friendLinks.findOne(
        { normalizedUrl, id: { $ne: id }, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        ctx.session ? { session: ctx.session } : undefined
      )
      if (existing) throw new Error('DUPLICATE')

      const now = new Date()
      const $set: any = { name, url, normalizedUrl, description, avatar, updatedAt: now }
      if (nextStatus) $set.status = nextStatus

      await friendLinks.updateOne(
        { id },
        { $set },
        ctx.session ? { session: ctx.session } : undefined
      )
      return { id: String(id), name, url, description, avatar, status: nextStatus || old.status }
    })

    setResponseStatus(event, 200)
    return { status: 200, msg: '更新成功', data }
  } catch (error: any) {
    if (String(error?.message).includes('NOT_FOUND')) {
      setResponseStatus(event, 404)
      return { status: 404, msg: '友链不存在', data: null }
    }
    if (String(error?.message).includes('DUPLICATE')) {
      setResponseStatus(event, 400)
      return { status: 400, msg: '该站点已存在', data: null }
    }
    console.error('更新友链失败:', error)
    setResponseStatus(event, 500)
    return { status: 500, msg: '服务器错误', data: null }
  }
})
