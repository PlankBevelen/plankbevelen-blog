import { pool } from '../pool/index.js';
import userService from './userService.js';

// 评论服务类
class CommentService {
    // 添加评论
    async addComment(userId, talkId, content) {
        try {
            // 开始事务
            await pool.promise().query('START TRANSACTION');
            
            try {
                // 插入评论
                const [result] = await pool.promise().query(
                    'INSERT INTO talk_comments (user_id, talk_id, content, created_at) VALUES (?, ?, ?, NOW())',
                    [userId, talkId, content]
                );
                
                // 更新说说的评论数量
                await pool.promise().query(
                    'UPDATE talks SET comment_count = comment_count + 1 WHERE id = ?',
                    [talkId]
                );
                
                // 获取更新后的评论数量
                const [countResult] = await pool.promise().query(
                    'SELECT comment_count FROM talks WHERE id = ?',
                    [talkId]
                );
                
                // 获取评论人信息
                const userInfo = await userService.getUserById(userId);
                
                // 提交事务
                await pool.promise().query('COMMIT');
                
                return {
                    success: true,
                    commentCount: countResult[0].comment_count,
                    comment: {
                        id: result.insertId,
                        user_id: userId,
                        talk_id: talkId,
                        content: content,
                        created_at: new Date().toISOString(),
                        user: {
                            id: userInfo.id,
                            nickname: userInfo.nickname,
                            avatar: userInfo.avatar
                        }
                    }
                };
            } catch (error) {
                // 回滚事务
                await pool.promise().query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            throw new Error('添加评论失败: ' + error.message);
        }
    }
}

export default new CommentService();