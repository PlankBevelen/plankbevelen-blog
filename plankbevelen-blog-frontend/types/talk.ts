interface author {
    nickname: string,
    avatar: string,
}

export interface Talk extends author {
    id: number,
    user_id: number,
    content: string,
    images: string[],
    status: 'published' | 'draft',
    like_count: number,
    comment_count: number,
    create_at: string,
    update_at: string, 
}

export interface TalkComment extends author {
    user_id: number,
    talk_id: number,
    content: string,
    createTime: string,
    updateTime: string,
}

export interface TalkLike extends author {
    user_id: number,
    talk_id: number,
    isLike: boolean,
    createTime: string,
    updateTime: string,
}

export interface LikeResponse {
  isLiked: boolean
  count: number
}

// 批量点赞状态接口
export interface BatchLikeStatus {
  [talkId: string]: LikeResponse
}