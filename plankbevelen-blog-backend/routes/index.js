import express from "express";
import userRouter from "./user.js";

const router = express.Router();

// 注册用户相关路由
router.use('/user', userRouter);

// 健康检查接口
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: '服务运行正常',
        timestamp: new Date().toISOString()
    });
});

export default router;

