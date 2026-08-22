import { isSafeHttpUrl } from './url-safe'

export type FriendLinkInput = {
  name: string
  url: string
  description: string
  avatar: string
}

const MAX_NAME = 50
const MAX_URL = 2048
const MAX_DESC = 200

function stripTags(value: string): string {
  return String(value || '').replace(/<[^>]*>/g, '').trim()
}

/** 归一化 URL 用于查重（小写协议 + 主机、去尾斜杠） */
export function normalizeUrl(value: string): string {
  try {
    const u = new URL(String(value))
    const path = u.pathname.replace(/\/+$/, '')
    return `${u.protocol}//${u.host.toLowerCase()}${path}`
  } catch {
    return String(value || '').trim().toLowerCase()
  }
}

/** 校验并清洗友链输入；返回 { ok, value } 或 { ok:false, msg } */
export function validateFriendLinkInput(
  input: Partial<FriendLinkInput>
): { ok: true; value: FriendLinkInput } | { ok: false; msg: string } {
  const name = stripTags(input?.name || '')
  const url = String(input?.url || '').trim()
  const description = stripTags(input?.description || '').slice(0, MAX_DESC)
  const avatar = String(input?.avatar || '').trim()

  if (!name) return { ok: false, msg: '站点名称不能为空' }
  if (name.length > MAX_NAME) return { ok: false, msg: `站点名称不能超过 ${MAX_NAME} 字` }
  if (!url) return { ok: false, msg: '站点地址不能为空' }
  if (url.length > MAX_URL) return { ok: false, msg: '站点地址过长' }
  if (!isSafeHttpUrl(url)) return { ok: false, msg: '站点地址仅支持 http/https 协议' }
  if (avatar && (avatar.length > MAX_URL || !isSafeHttpUrl(avatar))) {
    return { ok: false, msg: '头像地址仅支持 http/https 协议' }
  }

  return { ok: true, value: { name, url, description, avatar } }
}
