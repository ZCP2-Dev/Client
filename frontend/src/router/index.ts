import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import UserManagement from '../views/UserManagement.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard', component: Home, meta: { requiresAuth: true } },
  { path: '/user-management', name: 'UserManagement', component: UserManagement, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;