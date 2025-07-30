<template>
  <div class="user-management-container">
    <div class="header-actions">
      <h2>用户管理</h2>
      <button @click="showAddUserModal = true" class="add-user-btn">
        <IconMdiPlus style="margin-right: 5px;" />添加用户
      </button>
    </div>

    <div class="user-table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td class="actions">
              <button @click="editUser(user)" class="edit-btn">
                <IconMdiPencil style="font-size: 1em;" />
              </button>
              <button @click="deleteUser(user.id)" class="delete-btn" :disabled="user.username === 'admin'">
                <IconMdiDelete style="font-size: 1em;" />
              </button>
            </td>
          </tr>
          <tr v-if="users.length === 0 && !loading">
            <td colspan="4" class="no-data">暂无用户数据</td>
          </tr>
          <tr v-if="loading">
            <td colspan="4" class="loading">
              <IconMdiLoading class="spin" style="font-size: 1.5em;" />
              <span>加载中...</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加/编辑用户模态框 -->
    <div v-if="showAddUserModal || showEditUserModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ showEditUserModal ? '编辑用户' : '添加用户' }}</h3>
          <button @click="closeModal" class="close-btn">
            <IconMdiClose />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="user-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              required
              class="form-control"
              :disabled="showEditUserModal && formData.username === 'admin'"
            />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              :required="!showEditUserModal"
              class="form-control"
              placeholder="不修改请留空"
            />
          </div>
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="cancel-btn">取消</button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <IconMdiLoading v-if="isSubmitting" class="spin" style="margin-right: 5px;" />
              {{ isSubmitting ? '处理中...' : (showEditUserModal ? '更新' : '添加') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import IconMdiPlus from '~icons/mdi/plus';
import IconMdiPencil from '~icons/mdi/pencil';
import IconMdiDelete from '~icons/mdi/delete';
import IconMdiClose from '~icons/mdi/close';
import IconMdiLoading from '~icons/mdi/loading';

interface User {
  id: number;
  username: string;
  created_at: string;
}

const users = ref<User[]>([]);
const loading = ref(true);
const showAddUserModal = ref(false);
const showEditUserModal = ref(false);
const errorMessage = ref('');
const isSubmitting = ref(false);

const formData = reactive<{ id?: number; username: string; password: string }>({
  username: '',
  password: ''
});

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/users', {
      withCredentials: true
    });
    users.value = response.data.users;
  } catch (err) {
    console.error('获取用户列表失败:', err);
    errorMessage.value = '获取用户列表失败，请刷新页面重试';
  } finally {
    loading.value = false;
  }
};

// 添加或编辑用户
const handleSubmit = async () => {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    if (showEditUserModal.value && formData.id) {
      // 编辑用户
      const data = { username: formData.username };
      if (formData.password) {
        data.password = formData.password;
      }

      await axios.put(`/api/users/${formData.id}`, data, {
        withCredentials: true
      });
    } else {
      // 添加用户
      await axios.post('/api/users', formData, {
        withCredentials: true
      });
    }

    // 刷新用户列表并关闭模态框
    fetchUsers();
    closeModal();
  } catch (err: any) {
    console.error('保存用户失败:', err);
    errorMessage.value = err.response?.data?.message || '保存用户失败，请重试';
  } finally {
    isSubmitting.value = false;
  }
};

// 编辑用户
const editUser = (user: User) => {
  formData.id = user.id;
  formData.username = user.username;
  formData.password = '';
  showEditUserModal.value = true;
  showAddUserModal.value = false;
  errorMessage.value = '';
};

// 删除用户
const deleteUser = async (id: number) => {
  if (!confirm('确定要删除此用户吗？')) return;

  try {
    await axios.delete(`/api/users/${id}`, {
      withCredentials: true
    });
    fetchUsers();
  } catch (err: any) {
    console.error('删除用户失败:', err);
    errorMessage.value = err.response?.data?.message || '删除用户失败，请重试';
  }
};

// 关闭模态框
const closeModal = () => {
  showAddUserModal.value = false;
  showEditUserModal.value = false;
  formData.username = '';
  formData.password = '';
  formData.id = undefined;
  errorMessage.value = '';
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 页面加载时获取用户列表
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-management-container {
  padding: 1.5rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-user-btn {
  background-color: #41B883;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-user-btn:hover {
  background-color: #359469;
}

.user-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 0.75rem 1rem;
  text-align: left;
}

.user-table thead {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e9ecef;
}

.user-table tbody tr {
  border-bottom: 1px solid #f1f3f5;
}

.user-table tbody tr:last-child {
  border-bottom: none;
}

.user-table tbody tr:hover {
  background-color: #f8f9fa;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-btn {
  color: #3498db;
}

.edit-btn:hover {
  background-color: #ebf5fb;
}

.delete-btn {
  color: #e74c3c;
}

.delete-btn:hover:not(:disabled) {
  background-color: #fdedeb;
}

.delete-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.no-data,
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
}

.user-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #444;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-control:disabled {
  background-color: #f8 f9fa;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.cancel-btn {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #444;
}

.submit-btn {
  background-color: #41B883;
  color: white;
  border: none;
  margin-left: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: #359469;
}

.submit-btn:disabled {
  background-color: #a5d6b9;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  padding: 0.75rem;
  background-color: #fef2f2;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>