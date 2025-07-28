import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../pool/index.js';

// 用户注册
export const createUser = async (nickname, email, password) => {
    try {
        // 检查邮箱是否已存在
        const [existing] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            throw new Error('邮箱已存在');
        }
        
        // 检查昵称是否已存在
        const [nicknameExists] = await pool.promise().query('SELECT * FROM users WHERE nickname = ?', [nickname]);
        if (nicknameExists.length > 0) {
            throw new Error('昵称已存在');
        }
        
        // 验证前端传来的密码是否为有效的SHA256哈希
        if (!/^[a-f0-9]{64}$/i.test(password)) {
            throw new Error('密码格式无效');
        }
        
        // 对SHA256哈希进行bcrypt二次加密
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // 创建用户
        const [result] = await pool.promise().query(
            'INSERT INTO users (nickname, email, password, created_at) VALUES (?, ?, ?, NOW())',
            [nickname, email, hashedPassword]
        );
        
        return {
            id: result.insertId,
            nickname,
            email,
            created_at: new Date()
        };
    } catch (error) {
        throw error;
    }
};

// 用户登录
export const loginUser = async (email, password) => {
    try {
        if (!/^[a-f0-9]{64}$/i.test(password)) {
            throw new Error('密码格式无效');
        }
        
        // 查找用户
        const [users] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            throw new Error('用户不存在');
        }
        
        const user = users[0];
        
        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('密码错误');
        }
        
        // 返回用户信息
        const { password: _, ...userInfo } = user;
        return userInfo;
    } catch (error) {
        throw error;
    }
};

// 根据ID获取用户信息
export const getUserById = async (userId) => {
    try {
        const [users] = await pool.promise().query('SELECT id, nickname, email, created_at FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            throw new Error('用户不存在');
        }
        return users[0];
    } catch (error) {
        throw error;
    }
};

// 更新用户信息
export const updateUser = async (userId, updateData) => {
    try {
        const { nickname, email } = updateData;
        const updates = [];
        const values = [];
        
        if (nickname) {
            updates.push('nickname = ?');
            values.push(nickname);
        }
        
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        
        if (updates.length === 0) {
            throw new Error('没有要更新的数据');
        }
        
        values.push(userId);
        
        await pool.promise().query(
            `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        
        return await getUserById(userId);
    } catch (error) {
        throw error;
    }
};