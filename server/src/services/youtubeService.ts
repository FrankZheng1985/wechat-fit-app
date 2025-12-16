import Parser from 'rss-parser';
import { pool } from '../config/database';

const parser = new Parser();

// Youtube RSS feed URL format
const getYoutubeRssUrl = (channelId: string) => 
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

export interface VideoItem {
  videoId: string;
  channelId: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: Date;
}

/**
 * 从 Youtube RSS 获取指定频道的最新视频
 * 注意：本地开发需要配置代理访问 Youtube
 */
export async function fetchChannelVideos(channelId: string): Promise<VideoItem[]> {
  try {
    const feed = await parser.parseURL(getYoutubeRssUrl(channelId));
    
    return feed.items.map(item => ({
      videoId: item.id?.split(':').pop() || '',
      channelId,
      title: item.title || '',
      thumbnailUrl: `https://i.ytimg.com/vi/${item.id?.split(':').pop()}/hqdefault.jpg`,
      videoUrl: item.link || '',
      publishedAt: new Date(item.pubDate || Date.now()),
    }));
  } catch (error) {
    console.error(`Error fetching channel ${channelId}:`, error);
    return [];
  }
}

/**
 * 同步视频到数据库
 */
export async function syncVideosToDb(videos: VideoItem[]): Promise<number> {
  let insertedCount = 0;
  
  for (const video of videos) {
    try {
      await pool.query(
        `INSERT INTO youtube_feeds (channel_id, video_id, title, thumbnail_url, video_url, published_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (video_id) DO NOTHING`,
        [video.channelId, video.videoId, video.title, video.thumbnailUrl, video.videoUrl, video.publishedAt]
      );
      insertedCount++;
    } catch (error) {
      console.error('Error inserting video:', error);
    }
  }
  
  return insertedCount;
}

/**
 * 获取数据库中的视频列表
 */
export async function getVideosFromDb(limit = 20, offset = 0) {
  const result = await pool.query(
    `SELECT * FROM youtube_feeds ORDER BY published_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}
