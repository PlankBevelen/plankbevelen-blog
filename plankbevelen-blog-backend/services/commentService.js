import { pool } from '../pool/index.js';

// 评论服务类
class CommentService {
    // 添加评论
    async addComment(userId, talkId, content) {
        try {
            const [result] = await pool.promise().query(
                'INSERT INTO talk_comments (user_id, talk_id, content) VALUES (?, ?, ?)',
                [userId, talkId, content]
            );
            console.log("插入评论结果")
            console.log(result)
            return result;
        } catch (error) {
            throw new Error('添加评论失败: ' + error.message);
        }
    }
}

export default new CommentService();