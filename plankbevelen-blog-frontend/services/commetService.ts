import http from "~/utils/http-common"
import type { TalkComment } from "~/types/talk"

class CommetService {
    // 批量获取评论列表
    async getCommentList(talkId: number) : Promise<TalkComment[]> {
        const response = await http.get(`/comment/${talkId}`)
        return response.data.data as TalkComment[]
    }

    // 评论
    async comment(userId: number, talkId: number, content: string) : Promise<TalkComment> {
        const response = await http.post(`/comment/${talkId}`, {
            userId,
            content
        })
        return response.data.data as TalkComment
    }
}

export default new CommetService()