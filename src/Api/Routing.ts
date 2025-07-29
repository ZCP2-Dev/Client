import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
 
const app = express();
 
app.use(bodyParser.json());
app.use(cors());
 
// 定义GET请求的路由
app.get('/api', (req, res) => {
  console.log(req.body);
  res.send(
    [{
      date: "2020年",
      address: "罗湖区",
      value: "2900",
    },
    {
      date: "2021年",
      address: "南山区",
      value: "1200",
    },
    {
      date: "2022年",
      address: "宝安区",
      value: "700",
    },
    {
      date: "2023年",
      address: "福田区",
      value: "450",
    }]
  );
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