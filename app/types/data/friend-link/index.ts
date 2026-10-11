export type FriendLinkStatus = 'pending' | 'approved' | 'rejected'

export type FriendLink = {
  id: string
  name: string
  url: string
  description: string
  avatar: string
  status: FriendLinkStatus
  submitterIp?: string
  createTime?: string
  updateTime?: string
}

export type FriendLinkSelf = {
  name: string
  url: string
  description: string
  avatar: string
}
