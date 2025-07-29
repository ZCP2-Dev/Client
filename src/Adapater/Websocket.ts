import { WebSocket } from 'ws';

let sockets: WebSocket[] = [];

export function closeAllWebSocket() {
  sockets.forEach(socket => {
    socket.close();
  });
}

/**
 * 创建一个 WebSocket 实例
 * @param url WebSocket 地址
 * @returns WebSocket 实例
 */
export function createWebSocket(url: string) {
    const socket = new WebSocket(url);
    sockets.push(socket);
    return socket;
}