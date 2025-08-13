<script setup>
const data = await useFetch('/api/login')

// WebSocket相关状态
const message = ref('')
const receivedMessages = ref([])
const ws = ref(null)
const isConnected = ref(false)

// 连接到WebSocket服务器
const connectWebSocket = () => {
  if (ws.value) {
    ws.value.close()
  }

  // 连接到WebSocket服务器
  ws.value = new WebSocket('ws://localhost:1145')
  
  ws.value.onopen = function () {
    console.log('客户端连接成功')
    isConnected.value = true
    receivedMessages.value.push('连接已建立')
  }
  
  ws.value.onmessage = function (e) {
    console.log('收到服务器响应', e.data)
    receivedMessages.value.push(`服务器: ${e.data}`)
  }
  
  ws.value.onclose = function() {
    console.log("关闭客户端连接")
    isConnected.value = false
    receivedMessages.value.push('连接已关闭')
  }
  
  ws.value.onerror = function (error) {
    console.log("连接出错:", error)
    receivedMessages.value.push(`连接出错: ${error.message}`)
  }
}

// 发送消息到WebSocket服务器
const sendMessage = () => {
  if (ws.value && isConnected.value && message.value.trim() !== '') {
    ws.value.send(message.value)
    receivedMessages.value.push(`我: ${message.value}`)
    message.value = ''
  }
}

// 关闭WebSocket连接
const disconnectWebSocket = () => {
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
}

// 在组件卸载前关闭WebSocket连接
onBeforeUnmount(() => {
  disconnectWebSocket()
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <h1>WebSocket 测试页面</h1>
    
    <div>
      <button @click="connectWebSocket" :disabled="isConnected">
        {{ isConnected ? '已连接' : '连接WebSocket' }}
      </button>
      <button @click="disconnectWebSocket" :disabled="!isConnected">
        断开连接
      </button>
    </div>
    
    <div v-if="isConnected">
      <input 
        v-model="message" 
        placeholder="输入要发送的消息"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">发送</button>
    </div>
    
    <div>
      <h3>消息记录:</h3>
      <ul>
        <li v-for="(msg, index) in receivedMessages" :key="index">
          {{ msg }}
        </li>
      </ul>
    </div>
    
    <div>
      <p>API数据: {{ data }}</p>
    </div>
  </div>
</template>

<style scoped>
input {
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  margin: 5px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px;
  border-bottom: 1px solid #eee;
}
</style>