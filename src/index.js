const express = require('express');
const Router = require('./router');

// 创建Express应用
const app = express();
const port = 3421;

// 创建路由实例
const router = new Router();

// 使用路由
app.use(express.json());
app.use('/', router.getRouter());

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});

// 导出应用实例（用于测试或其他用途）
module.exports = app;