import express from "express";
import userRouter from "./user.js";
import talkRouter from "./talk.js";    

const router = express.Router();

router.use('/user', userRouter);
router.use('/talk', talkRouter);

// 健康检查接口
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: '服务运行正常',
        timestamp: new Date().toISOString()
    });
});

export default router;

