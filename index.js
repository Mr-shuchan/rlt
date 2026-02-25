const express = require('express');
const cors = require('cors');
// 引入瑞士星历表轮子
const swisseph = require('swisseph');

const app = express();
app.use(cors()); // 允许前端网页调用跨域
app.use(express.json());

// 这是一个测试接口，确保服务跑起来了
app.get('/', (req, res) => {
    res.send('人类图 API 后端已成功启动！');
});

// 核心排盘接口
app.post('/api/generate-chart', (req, res) => {
    const { name, date, time, location } = req.body;
    
    // 【核心轮子占位符】
    // 这里我们将接入 swisseph 进行真实的行星经度计算
    // 并将结果合成精美的 SVG/图片 URL 传给前端
    
    // 暂时返回模拟成功的响应体，供部署连通性测试
    res.json({
        success: true,
        message: "数据接收成功，后端已就绪",
        data: {
            name: name,
            receivedDate: date,
            // 稍后将在这里补充真实的排盘计算和图片生成逻辑
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
