-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    openid VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(255),
    avatar_url TEXT,
    gender VARCHAR(10),
    age_range VARCHAR(20),
    interests TEXT[], -- 兴趣爱好数组：['运动', '读书', '音乐', '旅行']
    daily_step_goal INTEGER DEFAULT 10000,
    is_onboarded BOOLEAN DEFAULT FALSE, -- 是否完成引导
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Youtube Feeds Table
CREATE TABLE IF NOT EXISTS youtube_feeds (
    id SERIAL PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL,
    video_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activities Table (Sports)
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    step_count INTEGER DEFAULT 0,
    calories_burned DECIMAL(10, 2) DEFAULT 0, -- kcal
    distance DECIMAL(10, 2) DEFAULT 0, -- meters
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Social Posts Table
CREATE TABLE IF NOT EXISTS social_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT,
    image_urls TEXT[], -- Array of image URLs
    anonymous_name VARCHAR(255), -- Generated name for the day e.g. "Sports Dog"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_youtube_published ON youtube_feeds(published_at DESC);
CREATE INDEX idx_activities_user_date ON activities(user_id, date);
CREATE INDEX idx_social_posts_created ON social_posts(created_at DESC);
