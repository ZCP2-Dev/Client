import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// 定义GET请求的路由
app.get('/api', (req, res) => {
  console.log(req.body);
  res.send({
    
  });
});

// 定义POST请求的路由
app.post('/api', (req, res) => {
  console.log(req.body);
  res.send('POST请求');
});

// 启动服务器
app.listen(3000, () => {
  console.log('Server started on port 3000');
});