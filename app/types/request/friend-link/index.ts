import type { FriendLink, FriendLinkSelf, FriendLinkStatus } from '@/types/data/friend-link'

export type FriendLinkSubmitPayload = {
  name: string
  url: string
  description: string
  avatar: string
  turnstileToken: string
}

export type FriendLinkAdminListQuery = {
  page?: number
  limit?: number
  status?: FriendLinkStatus | string
}

export type FriendLinkAdminWritePayload = Partial<
  Pick<FriendLink, 'name' | 'url' | 'description' | 'avatar' | 'status'>
>

export type FriendLinkSelfUpdatePayload = Partial<FriendLinkSelf>
