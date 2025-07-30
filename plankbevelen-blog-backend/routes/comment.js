import express from 'express';
import commentService from '../services/commentService.js';

const commentRouter = express.Router();

// 获取评论列表
/* commentRouter.get('/:talkId', async (req, res) => {
    const { talkId } = req.params;

    if (!talkId) {
        return res.status(400).json({
            success: false,
            message: '说说ID不能为空'
        });
    }

    try {
        const comments = await commentService.getCommentsByTalkId(talkId);
        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('获取评论列表失败:', error);
        res.status(500).json({
            success: false,
            message: error.message
         });
     }
 }); */

// 添加评论
commentRouter.post('/:talkId', async (req, res) => {
    const { talkId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !talkId || !content) {
        return res.status(400).json({
            success: false,
            message: '参数不能为空'
        });
    }

    try {
        const comment = await commentService.addComment(userId, talkId, content);
        res.status(201).json({
            success: true,
            data: comment,
            message: '评论成功'
        });
    } catch (error) {
        console.error('添加评论失败:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 删除评论
/* commentRouter.delete('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.body;

    if (!commentId || !userId) {
        return res.status(400).json({
            success: false,
            message: '参数不能为空'
        });
    }

    try {
        await commentService.deleteComment(commentId, userId);
        res.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        console.error('删除评论失败:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}); */


export default commentRouter;
