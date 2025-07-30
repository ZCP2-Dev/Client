<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="../assets/logo.png" alt="ZephyrCraft Panel Logo" class="logo" />
        <h2>ZephyrCraft Panel</h2>
        <p>请登录以继续</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="输入用户名"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="输入密码"
            class="form-control"
          />
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <button type="submit" class="login-btn" :disabled="isLoading">
          <IconMdiLoading v-if="isLoading" class="spin" style="margin-right: 8px;" />
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import IconMdiLoading from '~icons/mdi/loading';
import axios from 'axios';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const response = await axios.post('/api/login', {
      username: username.value,
      password: password.value
    });

    if (response.data.success) {
      // 存储登录状态到sessionStorage
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('username', username.value);
      router.push('/');
    } else {
      errorMessage.value = response.data.message || '登录失败，请检查用户名或密码';
    }
  } catch (err) {
    errorMessage.value = '网络错误，请稍后重试';
    console.error('登录请求失败:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
}

.login-header h2 {
  margin: 0 0 0.5rem;
  color: #333;
}

.login-header p {
  color: #666;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #444;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #41B883;
  box-shadow: 0 0 0 3px rgba(65, 184, 131, 0.1);
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border-radius: 6px;
  font-size: 0.9rem;
}

.login-btn {
  width: 100%;
  padding: 0.875rem;
  background-color: #41B883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover:not(:disabled) {
  background-color: #359469;
}

.login-btn:disabled {
  background-color: #a5d6b9;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>