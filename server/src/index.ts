import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initializeDatabase } from './config/database';
import youtubeRoutes from './routes/youtube';
import wechatRoutes from './routes/wechat';
import socialRoutes from './routes/social';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sports Reading Social API is running');
});

// Test DB connection
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/youtube', youtubeRoutes);
app.use('/api/wechat', wechatRoutes);
app.use('/api/social', socialRoutes);

// 启动服务器并初始化数据库
async function startServer() {
  try {
    // 自动初始化数据库表
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
