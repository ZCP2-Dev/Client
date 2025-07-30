import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import sqlite3 from 'better-sqlite3';

// 初始化数据库
const db = new sqlite3(path.join(__dirname, '../Storage/users.db'));
// 创建用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  -- 插入默认管理员用户 (密码: admin123)
  INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin123');
`);

const app = express();

// 配置会话
app.use(cookieParser());
app.use(session({
  secret: 'zephyrcraft_panel_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: undefined, // 会话cookie，浏览器关闭后失效
    httpOnly: true
  }
}));

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:1420', // 前端开发服务器地址
  credentials: true // 允许跨域请求携带cookie
}));
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// 定义GET请求的路由
app.get('/api', (req, res) => {
  console.log(req.body);
  res.send({
    
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // 查询用户
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (user && user.password === password) {
    // 设置会话
    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.send({ success: true, message: '登录成功' });
  } else {
    res.status(401).send({ success: false, message: '用户名或密码错误' });
  }
});

// 登出接口
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send({ success: false, message: '登出失败' });
    }
    res.send({ success: true, message: '登出成功' });
  });
})

// 验证登录状态的中间件
const requireAuth = ((req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).send({ success: false, message: '请先登录' });
  }
})

// 用户管理API
// 获取所有用户
app.get('/api/users', requireAuth, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, created_at FROM users').all();
    res.send({ success: true, users });
  } catch (err) {
    console.error('获取用户列表失败:', err);
    res.status(500).send({ success: false, message: '获取用户列表失败' });
  }
});

// 添加用户
app.post('/api/users', requireAuth, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ success: false, message: '用户名和密码不能为空' });
  }

  try {
    // 检查用户是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(409).send({ success: false, message: '用户名已存在' });
    }

    // 插入新用户
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password);
    res.send({ success: true, message: '用户添加成功', userId: result.lastInsertRowid });
  } catch (err) {
    console.error('添加用户失败:', err);
    res.status(500).send({ success: false, message: '添加用户失败' });
  }
});

// 更新用户
app.put('/api/users/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).send({ success: false, message: '用户名不能为空' });
  }

  try {
    // 检查用户是否存在
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return res.status(404).send({ success: false, message: '用户不存在' });
    }

    // 检查用户名是否已被其他用户使用
    const userWithSameName = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, id);
    if (userWithSameName) {
      return res.status(409).send({ success: false, message: '用户名已存在' });
    }

    // 更新用户信息
    if (password) {
      db.prepare('UPDATE users SET username = ?, password = ? WHERE id = ?').run(username, password, id);
    } else {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, id);
    }

    res.send({ success: true, message: '用户更新成功' });
  } catch (err) {
    console.error('更新用户失败:', err);
    res.status(500).send({ success: false, message: '更新用户失败' });
  }
});

// 删除用户
app.delete('/api/users/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  // 禁止删除管理员用户
  if (id === '1') {
    return res.status(403).send({ success: false, message: '禁止删除管理员用户' });
  }

  try {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).send({ success: false, message: '用户不存在' });
    }
    res.send({ success: true, message: '用户删除成功' });
  } catch (err) {
    console.error('删除用户失败:', err);
    res.status(500).send({ success: false, message: '删除用户失败' });
  }
});

// 受保护的API示例
app.get('/api/protected', requireAuth, (req, res) => {
  res.send({ success: true, user: req.session.username });
});

// 启动服务器
app.listen(3000, () => {
// 使用 ANSI 转义码输出彩色欢迎消息
  console.log('\x1b[32m%s\x1b[0m', '欢迎使用 ZephyrCraft-Panel-2 服务！');
  console.log('客户端服务已在 http://localhost:8080 启动成功')
});