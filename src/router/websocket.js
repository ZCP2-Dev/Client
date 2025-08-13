const express = require('express');
const websocketManager = require('../websocket');

// 创建路由实例
const router = express.Router();

// WebSocket连接路由
router.get('/connect', (req, res) => {
    try {
        websocketManager.connect();
        res.json({ 
            success: true, 
            message: 'WebSocket连接已启动',
            status: websocketManager.getStatus()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '连接失败: ' + error.message 
        });
    }
});

// WebSocket断开连接路由
router.post('/disconnect', (req, res) => {
    try {
        websocketManager.disconnect();
        res.json({ 
            success: true, 
            message: 'WebSocket连接已断开' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '断开连接失败: ' + error.message 
        });
    }
});

// WebSocket发送消息路由
router.post('/send', (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                message: '消息内容不能为空' 
            });
        }
        
        const result = websocketManager.sendMessage(message);
        if (result) {
            res.json({ 
                success: true, 
                message: '消息发送成功' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: '消息发送失败，WebSocket未连接' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '发送消息失败: ' + error.message 
        });
    }
});

// 获取WebSocket状态路由
router.get('/status', (req, res) => {
    try {
        const status = websocketManager.getStatus();
        res.json({ 
            success: true, 
            data: status 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '获取状态失败: ' + error.message 
        });
    }
});

module.exports = router;