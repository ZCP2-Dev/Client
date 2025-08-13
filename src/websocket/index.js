// WebSocket管理类
class WebSocketManager {
  constructor(url, timeout = 30 * 60 * 1000) { // 默认30分钟超时
    this.url = url;
    this.timeout = timeout;
    this.ws = null;
    this.isConnected = false;
    this.lastActivity = Date.now();
    this.timeoutTimer = null;
    this.reconnectTimer = null;
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
  }

  // 连接到WebSocket服务器
  connect(url) {
    // 如果已经连接，先关闭
    if (this.ws) {
      this.disconnect();
    }

    // 使用传入的URL或实例URL
    const connectUrl = url || this.url;
    
    try {
      this.ws = new WebSocket(connectUrl);
      
      this.ws.onopen = (event) => {
        this.isConnected = true;
        this.lastActivity = Date.now();
        this.resetTimeoutTimer();
        console.log('WebSocket连接成功');
        this.connectionCallbacks.forEach(callback => callback({ type: 'connected', event }));
      };

      this.ws.onmessage = (event) => {
        this.lastActivity = Date.now();
        this.resetTimeoutTimer();
        console.log('收到消息:', event.data);
        this.messageCallbacks.forEach(callback => callback({ type: 'message', data: event.data, event }));
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.clearTimers();
        console.log('WebSocket连接已关闭');
        this.connectionCallbacks.forEach(callback => callback({ type: 'disconnected', event }));
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket错误:', event);
        this.connectionCallbacks.forEach(callback => callback({ type: 'error', event }));
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      this.connectionCallbacks.forEach(callback => callback({ type: 'error', error }));
    }
  }

  // 发送消息
  sendMessage(message) {
    if (this.isConnected && this.ws) {
      this.lastActivity = Date.now();
      this.resetTimeoutTimer();
      this.ws.send(message);
      return true;
    }
    return false;
  }

  // 添加消息监听器
  onMessage(callback) {
    this.messageCallbacks.push(callback);
  }

  // 添加连接状态监听器
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  // 移除消息监听器
  removeMessageListener(callback) {
    const index = this.messageCallbacks.indexOf(callback);
    if (index > -1) {
      this.messageCallbacks.splice(index, 1);
    }
  }

  // 移除连接状态监听器
  removeConnectionListener(callback) {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }

  // 重置超时计时器
  resetTimeoutTimer() {
    // 清除现有计时器
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }

    // 设置新的超时计时器
    this.timeoutTimer = setTimeout(() => {
      console.log('WebSocket连接超时，自动断开');
      this.disconnect();
    }, this.timeout);
  }

  // 清除所有计时器
  clearTimers() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // 手动断开连接
  disconnect() {
    this.clearTimers();
    
    if (this.ws) {
      // 移除事件监听器
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      // 关闭连接
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      
      this.ws = null;
      this.isConnected = false;
    }
    
    console.log('WebSocket连接已手动断开');
  }

  // 获取连接状态
  getStatus() {
    // 检查WebSocket对象是否存在
    if (!this.ws) {
      this.isConnected = false;
    } else {
      // 根据WebSocket的readyState更新连接状态
      switch (this.ws.readyState) {
        case WebSocket.CONNECTING:
          // 正在连接
          this.isConnected = false;
          break;
        case WebSocket.OPEN:
          // 已连接
          this.isConnected = true;
          break;
        case WebSocket.CLOSING:
          // 正在关闭
          this.isConnected = false;
          break;
        case WebSocket.CLOSED:
          // 已关闭
          this.isConnected = false;
          break;
        default:
          this.isConnected = false;
      }
    }
    
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : null,
      lastActivity: this.lastActivity,
      url: this.url
    };
  }
}

// 导出WebSocket管理器实例
const websocketManager = new WebSocketManager('ws://localhost:1145');
module.exports = websocketManager;