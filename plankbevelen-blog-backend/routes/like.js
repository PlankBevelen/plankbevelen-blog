import express from 'express';
import { pool } from '../pool/index.js';

const likeRouter = express.Router();

// 切换点赞状态
likeRouter.post('/toggle', async (req, res) => {
    const { user_id, talk_id } = req.body;
    
    if (!user_id || !talk_id) {
        return res.status(400).json({
            success: false,
            message: '用户ID和说说ID不能为空'
        });
    }
    
    try {        
        // 检查是否已经点赞
        const [existingLike] = await pool.promise().query(
            'SELECT * FROM talk_likes WHERE user_id = ? AND talk_id = ?',
            [user_id, talk_id]
        );
        
        let isLiked = false;
        let countChange = 0;

        if (existingLike.length > 0) {
            // 已存在记录，切换状态
            const currentStatus = existingLike[0].isLike;
            const newStatus = currentStatus === 1 ? 0 : 1;
            
            await pool.promise().query(
                'UPDATE talk_likes SET isLike = ?, updated_at = NOW() WHERE user_id = ? AND talk_id = ?',
                [newStatus, user_id, talk_id]
            );
            
            isLiked = newStatus === 1;
            // 计算点赞数变化：从0到1是+1，从1到0是-1
            countChange = newStatus === 1 ? 1 : -1;
        } else {
            // 不存在记录，创建新的点赞记录
            await pool.promise().query(
                'INSERT INTO talk_likes (user_id, talk_id, isLike, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())',
                [user_id, talk_id]
            );
            
            isLiked = true;
            countChange = 1; // 新增点赞，+1
        }
        
        // 在原有基础上更新点赞数（加1或减1）
        const [updateResult] = await pool.promise().query(
            'UPDATE talks SET like_count = GREATEST(0, like_count + ?) WHERE id = ?',
            [countChange, talk_id]
        );
        
        // 获取更新后的点赞数
        const [talkInfo] = await pool.promise().query(
            'SELECT like_count FROM talks WHERE id = ?',
            [talk_id]
        );
        
        res.status(200).json({
            success: true,
            data: {
                isLiked,
                count: talkInfo[0].like_count
            },
            message: isLiked ? '点赞成功' : '取消点赞成功'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: '操作失败，请重试'
        });
    } 
});

// 获取点赞状态
likeRouter.get('/status', async (req, res) => {
    const { user_id, talk_id } = req.query;
    
    if (!user_id || !talk_id) {
        return res.status(400).json({
            success: false,
            message: '用户ID和说说ID不能为空'
        });
    }
    
    try {
        // 获取用户点赞状态和说说点赞数
        const [result] = await pool.execute(
            `SELECT 
                tl.isLike,
                t.like_count as count
             FROM talks t
             LEFT JOIN talk_likes tl ON t.id = tl.talk_id AND tl.user_id = ?
             WHERE t.id = ?`,
            [user_id, talk_id]
        );
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: '说说不存在'
            });
        }
        
        const isLiked = result[0].isLike === 1;
        
        res.json({
            success: true,
            data: {
                isLiked,
                count: result[0].count || 0
            }
        });
        
    } catch (error) {
        console.error('获取点赞状态失败:', error);
        res.status(500).json({
            success: false,
            message: '获取状态失败'
        });
    }
});

// 批量获取点赞状态
likeRouter.post('/batch-status', async (req, res) => {
    const { user_id, talk_ids } = req.body;
    
    if (!user_id || !talk_ids || !Array.isArray(talk_ids)) {
        return res.status(400).json({
            success: false,
            message: '参数错误'
        });
    }
    
    try {
        const result = {};
        
        // 批量获取用户点赞状态和说说点赞数
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
        
        // 构建结果
        talk_ids.forEach(talkId => {
            const row = rows.find(r => r.talk_id === talkId);
            
            result[talkId] = {
                isLiked: row ? row.isLike === 1 : false,
                count: row ? (row.count || 0) : 0
            };
        });
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('批量获取点赞状态失败:', error);
        res.status(500).json({
            success: false,
            message: '获取状态失败'
        });
    }
});

// 获取点赞用户列表
likeRouter.get('/users', async (req, res) => {
    const { talk_id, page = 1, limit = 20 } = req.query;
    
    if (!talk_id) {
        return res.status(400).json({
            success: false,
            message: '说说ID不能为空'
        });
    }
    
    try {
        const offset = (page - 1) * limit;
        
        const [users] = await pool.execute(
            `SELECT u.id, u.nickname, u.avatar, tl.created_at as like_time 
             FROM talk_likes tl 
             JOIN users u ON tl.user_id = u.id 
             WHERE tl.talk_id = ? AND tl.isLike = 1 
             ORDER BY tl.created_at DESC 
             LIMIT ? OFFSET ?`,
            [talk_id, parseInt(limit), offset]
        );
        
        res.json({
            success: true,
            data: users
        });
        
    } catch (error) {
        console.error('获取点赞用户列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户列表失败'
        });
    }
});

export default likeRouter;