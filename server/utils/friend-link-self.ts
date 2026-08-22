import type { Db } from 'mongodb'
import { getCollections } from './mongo'
import { isSafeHttpUrl } from './url-safe'

export type FriendLinkSelf = {
  name: string
  url: string
  description: string
  avatar: string
}

const SELF_ID = 'friend-link-self'

const DEFAULTS: FriendLinkSelf = {
  name: 'plankbevelen',
  url: 'https://plankbevelen.cn',
  description: '个人技术博客，分享前端开发、工程实践与学习记录。',
  avatar: 'https://plankbevelen.cn/img/logo.webp'
}

/** 读取本站友链信息；不存在时返回默认值（不落库） */
export async function getFriendLinkSelf(db: Db): Promise<FriendLinkSelf> {
  const { siteConfigs } = getCollections(db)
  const doc = await siteConfigs.findOne({ _id: SELF_ID })
  if (doc?.data) {
    return { ...DEFAULTS, ...(doc.data as Partial<FriendLinkSelf>) }
  }
  return { ...DEFAULTS }
}

/** 校验并保存本站友链信息 */
export async function updateFriendLinkSelf(input: Partial<FriendLinkSelf>, db: Db): Promise<FriendLinkSelf> {
  const { siteConfigs } = getCollections(db)
  const current = await getFriendLinkSelf(db)

  const name = String(input?.name ?? '').trim().slice(0, 50) || current.name
  const description = String(input?.description ?? '').trim().slice(0, 200)
  const url = isSafeHttpUrl(String(input?.url ?? '')) ? String(input.url).trim() : current.url
  const avatar = String(input?.avatar ?? '').trim()
  const nextAvatar = avatar && isSafeHttpUrl(avatar) ? avatar : (avatar === '' ? '' : current.avatar)

  const next: FriendLinkSelf = { name, url, description, avatar: nextAvatar }

  await siteConfigs.updateOne(
    { _id: SELF_ID },
    {
      $set: { type: SELF_ID, data: next, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  )
  return next
}
