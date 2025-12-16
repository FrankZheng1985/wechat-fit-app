import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 支持 Render 的 DATABASE_URL 或分离的环境变量
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sports_reading_social',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// 数据库初始化函数
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Initializing database tables...');
    
    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        openid VARCHAR(255) UNIQUE NOT NULL,
        nickname VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Youtube Feeds Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS youtube_feeds (
        id SERIAL PRIMARY KEY,
        channel_id VARCHAR(255) NOT NULL,
        video_id VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        thumbnail_url TEXT,
        video_url TEXT NOT NULL,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activities Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        step_count INTEGER DEFAULT 0,
        calories_burned DECIMAL(10, 2) DEFAULT 0,
        distance DECIMAL(10, 2) DEFAULT 0,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `);

    // Social Posts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT,
        image_urls TEXT[],
        anonymous_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes if not exists
    await client.query(`CREATE INDEX IF NOT EXISTS idx_youtube_published ON youtube_feeds(published_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC)`);

    console.log('Database tables initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}
