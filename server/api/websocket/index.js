export default defineEventHandler((event) => {
    return {
        hello: 'world'
    }
})



// WebSocket构造函数，创建WebSocket对象
let ws = new WebSocket('ws://localhost:1145')

// 连接成功后的回调函数
ws.onopen = function (params) {
    console.log('客户端连接成功')
    // 向服务器发送消息
    ws.send('hello')
};

// 从服务器接受到信息时的回调函数
ws.onmessage = function (e) {
    console.log('收到服务器响应', e.data)
};

// 连接关闭后的回调函数
ws.onclose = function(evt) {
    console.log("关闭客户端连接");
};

// 连接失败后的回调函数
ws.onerror = function (evt) {
    console.log("连接失败了");
};


// 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，这样服务端会抛异常。
window.onbeforeunload = function() {
    ws.close();
}
