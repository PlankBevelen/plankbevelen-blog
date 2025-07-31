import express from 'express';
import { pool } from '../pool/index.js';
import LikeService from '../services/likeService.js';

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
        const result = await LikeService.toggle(user_id, talk_id);
        
        res.status(200).json({
            success: true,
            data: {
                isLiked: result.isLiked,
                count: result.count
            },
            message: result.isLiked ? '点赞成功' : '取消点赞成功'
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
        const result = await LikeService.getStatus(user_id, talk_id);
        
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
            message: '用户ID不能为空，说说ID必须是数组'
        });
    }
    
    try {
        const result = {};
        
        // 批量获取用户点赞状态和说说点赞数
        const rows = await LikeService.getBatchLikeStatus(user_id, talk_ids);
        
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
/* likeRouter.get('/users', async (req, res) => {
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
}); */

export default likeRouter;