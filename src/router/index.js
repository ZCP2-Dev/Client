const express = require('express');
const websocketRouter = require('./websocket');

class Router {
    constructor() {
        this.router = express.Router();
        this.setupRoutes();
    }
    
    setupRoutes() {
        // 注册websocket路由，路径前缀为/websocket
        this.router.use('/websocket', websocketRouter);
        
        // 这里可以注册其他路由模块
        // 例如: this.router.use('/api', apiRouter);
    }
    
    // 允许外部注册路由模块的方法
    registerRoute(path, routeModule) {
        this.router.use(path, routeModule);
    }
    
    getRouter() {
        return this.router;
    }
}

module.exports = Router;