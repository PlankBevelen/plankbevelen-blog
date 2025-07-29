import express from 'express';
import { pool } from '../pool/index.js';

const talkRouter = express.Router();

// 发布说说
talkRouter.post('/publish', async (req, res, next) => {
  try {
    const { content, status, images, userId } = req.body;
    // 如果没有传入userId，默认使用1（管理员ID）
    const user_id = userId || 1;
    const result = await pool.promise().query("INSERT INTO talks (content, status, images, user_id) VALUES (?, ?, ?, ?)", [content, status, images, user_id]);
    // 返回新增的说说
    res.status(201).json({
      message: '发布成功',
      data: result
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: '发布失败',
      error: err.message
    });
  }
})

// 获取全部说说
talkRouter.post('/all', async (req, res, next) => {
  try {
    const result = await pool.promise().query(`
      SELECT t.*, u.nickname, u.avatar 
      FROM talks t 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC
    `);
    res.status(200).json({
      message: '获取全部说说成功',
      data: result
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: '获取全部说说失败',
      error: err.message
    });
  }
})

// 获取所有发布说说
talkRouter.get('/published', async (req, res, next) => {
  try {
    const result = await pool.promise().query(`
      SELECT t.*, u.nickname, u.avatar 
      FROM talks t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE t.status = 'published' 
      ORDER BY t.created_at DESC
    `);
    res.status(200).json({
      message: '获取所有发布说说成功',
      data: result
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: '获取所有发布说说失败',
      error: err.message
    });
  }
})

// 更新说说内容
talkRouter.post('/update', async (req, res, next) => {
  try {
    const { id, content, status, images } = req.body;
    const result = await pool.promise().query("UPDATE talks SET content = ?, status = ?, images = ? WHERE id = ?", [content, status, images, id]);
    res.status(200).json({
      message: '更新说说成功',
      data: result
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: '更新说说失败',
      error: err.message
    });
  }
})

// 删除说说
talkRouter.delete('/delete/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 先检查说说是否存在
    const checkResult = await pool.promise().query("SELECT id FROM talks WHERE id = ?", [id]);
    if (checkResult[0].length === 0) {
      return res.status(404).json({
        code: 404,
        message: '说说不存在'
      });
    }
    
    // 执行删除操作
    const result = await pool.promise().query("DELETE FROM talks WHERE id = ?", [id]);
    
    if (result[0].affectedRows > 0) {
      res.status(200).json({
        code: 200,
        message: '删除成功',
        data: result
      });
    } else {
      res.status(500).json({
        code: 500,
        message: '删除失败'
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      code: 500,
      message: '删除失败',
      error: err.message
    });
  }
})

export default talkRouter;