
import { pool } from '../pool/index.js';

class LikeService {
    
    async toggle(user_id, talk_id) {
        // 参数验证
        if (!user_id || !talk_id) {
            throw new Error('用户ID和说说ID不能为空');
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // 开启事务
            await connection.beginTransaction();
            
            // 检查说说是否存在
            const [talkExists] = await connection.query(
                'SELECT id FROM talks WHERE id = ?',
                [talk_id]
            );
            
            if (talkExists.length === 0) {
                throw new Error('说说不存在');
            }
            
            // 是否已经点赞
            const existingLike = await this.checkLike(user_id, talk_id, connection);

            let isLiked = false;
            let countChange = 0;

            if (existingLike.length > 0) {
                // 已存在记录，切换状态
                const currentStatus = existingLike[0].isLike;
                const newStatus = currentStatus === 1 ? 0 : 1;
                
                await connection.query(
                    'UPDATE talk_likes SET isLike = ?, updated_at = NOW() WHERE user_id = ? AND talk_id = ?',
                    [newStatus, user_id, talk_id]
                );
                
                isLiked = newStatus === 1;
                // 计算点赞数变化：从0到1是+1，从1到0是-1
                countChange = newStatus === 1 ? 1 : -1;
            } else {
                // 不存在记录，创建新的点赞记录
                await connection.query(
                    'INSERT INTO talk_likes (user_id, talk_id, isLike, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())',
                    [user_id, talk_id]
                );
                isLiked = true;
                countChange = 1; // 新增点赞，+1
            }
            
            // 在原有基础上更新点赞数（加1或减1）
            await connection.query(
                'UPDATE talks SET like_count = GREATEST(0, like_count + ?) WHERE id = ?',
                [countChange, talk_id]
            );
            
            // 获取更新后的点赞数
            const [talkInfo] = await connection.query(
                'SELECT like_count FROM talks WHERE id = ?',
                [talk_id]
            );
            
            // 提交事务
            await connection.commit();
            
            return {
                isLiked,
                count: talkInfo[0]?.like_count || 0
            };
            
        } catch (error) {
            // 回滚事务
            await connection.rollback();
            console.error('点赞操作失败:', error);
            throw new Error(error.message || '操作失败，请重试');
        } finally {
            // 释放连接
            connection.release();
        }
    } 

    // 检查是否已经点赞
    async checkLike(user_id, talk_id, connection = null) {
        const queryConnection = connection || pool.promise();
        const [existingLike] = await queryConnection.query(
            'SELECT * FROM talk_likes WHERE user_id = ? AND talk_id = ?',
            [user_id, talk_id]
        );
        return existingLike;
    }
    
    // 获取点赞状态
    async getLikeStatus(user_id, talk_id) {
        if (!user_id || !talk_id) {
            throw new Error('用户ID和说说ID不能为空');
        }
        
        try {
            const [result] = await pool.promise().query(
                `SELECT 
                    tl.isLike,
                    t.like_count as count
                 FROM talks t
                 LEFT JOIN talk_likes tl ON t.id = tl.talk_id AND tl.user_id = ?
                 WHERE t.id = ?`,
                [user_id, talk_id]
            );
            
            if (result.length === 0) {
                throw new Error('说说不存在');
            }
            
            return {
                isLiked: result[0].isLike === 1,
                count: result[0].count || 0
            };
            
        } catch (error) {
            console.error('获取点赞状态失败:', error);
            throw new Error(error.message || '获取状态失败');
        }
    }

    // 批量获取用户点赞状态和说说点赞数
    async getBatchLikeStatus(user_id, talk_ids) {
        if (!user_id || !talk_ids || !Array.isArray(talk_ids)) {
            throw new Error('用户ID不能为空，说说ID必须是数组');
        }

        const placeholders = talk_ids.map(() => '?').join(',');
        const [rows] = await pool.promise().query(
            `SELECT 
                t.id as talk_id,
                t.like_count as count,
                tl.isLike
             FROM talks t
             LEFT JOIN talk_likes tl ON t.id = tl.talk_id AND tl.user_id = ?
             WHERE t.id IN (${placeholders})`,
            [user_id, ...talk_ids]
        );
        return rows;
    }

}

export default new LikeService();