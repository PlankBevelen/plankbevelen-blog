import express from 'express';
import { pool } from '../pool/index.js';
import jwt from 'jsonwebtoken';
import * as userService from '../services/userService.js';

const userRouter = express.Router();
const jwtkey = process.env.JWT_SECRET || "jwtkey";

// JWT中间件验证
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('后端中间件 - Authorization header:', authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('后端中间件 - 提取的token:', token ? '存在' : '不存在');
    
    if (!token) {
        console.log('后端中间件 - token缺失，返回401');
        return res.status(401).json({ message: '访问令牌缺失' });
    }
    
    jwt.verify(token, jwtkey, (err, user) => {
        if (err) {
            console.log('后端中间件 - token验证失败:', err.message);
            return res.status(403).json({ message: '令牌无效' });
        }
        console.log('后端中间件 - token验证成功，用户ID:', user.id);
        req.user = user;
        next();
    });
};

// 用户注册
userRouter.post('/register', async (req, res) => {
    try {
        const { nickname, password, email } = req.body;
        console.log('注册请求参数:', { nickname, password, email });
        
        // 参数验证
        if (!nickname || !password || !email) {
            return res.status(400).json({ message: '缺少必要参数' });
        }
        
        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: '邮箱格式不正确' });
        }
        
        // 密码长度验证
        if (password.length < 6) {
            return res.status(400).json({ message: '密码长度至少6位' });
        }
        
        const user = await userService.createUser(nickname, email, password);
        
        res.status(201).json({
            message: '注册成功',
            data: user
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(400).json({ message: error.message });
    }
});

// 用户登录
userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: '邮箱和密码不能为空' });
        }
        
        const user = await userService.loginUser(email, password);
        
        // 生成JWT令牌 (30天有效期)
        const token = jwt.sign(
            { id: user.id, email: user.email },
            jwtkey,
            { expiresIn: '30d' }
        );
        
        // 生成刷新令牌 (60天有效期)
        const refreshToken = jwt.sign(
            { id: user.id, email: user.email, type: 'refresh' },
            jwtkey,
            { expiresIn: '60d' }
        );
        
        res.json({
            message: '登录成功',
            data: {
                user,
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(401).json({ message: error.message });
    }
});

// 获取当前用户信息
userRouter.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);
        res.json({
            message: '获取用户信息成功',
            data: user
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(404).json({ message: error.message });
    }
});

// 刷新令牌
userRouter.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ message: '刷新令牌缺失' });
        }
        
        // 验证刷新令牌
        jwt.verify(refreshToken, jwtkey, async (err, decoded) => {
            if (err || decoded.type !== 'refresh') {
                return res.status(403).json({ message: '刷新令牌无效' });
            }
            
            try {
                // 获取用户信息
                const user = await userService.getUserById(decoded.id);
                
                // 生成新的访问令牌
                const newToken = jwt.sign(
                    { id: user.id, email: user.email },
                    jwtkey,
                    { expiresIn: '30d' }
                );
                
                res.json({
                    message: '令牌刷新成功',
                    data: {
                        token: newToken,
                        user
                    }
                });
            } catch (error) {
                console.error('刷新令牌错误:', error);
                res.status(404).json({ message: '用户不存在' });
            }
        });
    } catch (error) {
        console.error('刷新令牌错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新用户信息
userRouter.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { nickname, email } = req.body;
        const updateData = {};
        
        if (nickname) updateData.nickname = nickname;
        if (email) {
            // 邮箱格式验证
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: '邮箱格式不正确' });
            }
            updateData.email = email;
        }
        
        const user = await userService.updateUser(req.user.id, updateData);
        
        res.json({
            message: '更新用户信息成功',
            data: user
        });
    } catch (error) {
        console.error('更新用户信息错误:', error);
        res.status(400).json({ message: error.message });
    }
});

export default userRouter;