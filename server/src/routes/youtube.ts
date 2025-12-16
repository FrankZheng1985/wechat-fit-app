import { Router } from 'express';
import { fetchChannelVideos, syncVideosToDb, getVideosFromDb } from '../services/youtubeService';

const router = Router();

// 获取视频列表
router.get('/videos', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const videos = await getVideosFromDb(limit, offset);
    res.json({ success: true, data: videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch videos' });
  }
});

// 手动触发同步（开发用）
router.post('/sync', async (req, res) => {
  try {
    const channels = (process.env.YOUTUBE_CHANNELS || '').split(',').filter(Boolean);
    let totalInserted = 0;
    
    for (const channelId of channels) {
      const videos = await fetchChannelVideos(channelId.trim());
      const inserted = await syncVideosToDb(videos);
      totalInserted += inserted;
    }
    
    res.json({ success: true, message: `Synced ${totalInserted} videos` });
  } catch (error) {
    console.error('Error syncing videos:', error);
    res.status(500).json({ success: false, message: 'Failed to sync videos' });
  }
});

export default router;
