import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { youtubeApi } from '../../services/api';
import './index.scss';

interface VideoItem {
  id: number;
  video_id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  published_at: string;
}

export default function YoutubePage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const result = await youtubeApi.getVideos(20, 0);
    if (result.success && result.data) {
      setVideos(result.data);
    }
    setLoading(false);
  };

  const handleVideoClick = (video: VideoItem) => {
    Taro.setClipboardData({
      data: video.video_url,
      success: () => {
        Taro.showModal({
          title: '链接已复制',
          content: '由于小程序限制，无法直接播放。请打开浏览器粘贴链接观看。',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <View className='youtube-page'>
      {/* 顶部区域 */}
      <View className='page-hero'>
        <View className='hero-content'>
        <Text className='page-title'>📚 读书视频</Text>
          <Text className='page-subtitle'>精选博主的优质读书内容</Text>
        </View>
        <View className='hero-decoration'>
          <View className='deco-circle c1' />
          <View className='deco-circle c2' />
        </View>
      </View>

      {/* 视频列表 */}
      <ScrollView scrollY className='video-list'>
        <View className='video-list-inner'>
        {loading ? (
            <View className='loading-state'>
              <View className='loading-spinner' />
              <Text className='loading-text'>加载中...</Text>
          </View>
        ) : videos.length === 0 ? (
            <View className='empty-state'>
            <Text className='empty-icon'>📭</Text>
              <Text className='empty-title'>暂无视频内容</Text>
              <Text className='empty-desc'>请先在后台配置 YouTube 频道</Text>
          </View>
        ) : (
          videos.map(video => (
            <View 
              key={video.id} 
                className='video-card'
              onClick={() => handleVideoClick(video)}
            >
                <View className='thumbnail-wrapper'>
              <Image 
                className='video-thumbnail' 
                src={video.thumbnail_url} 
                mode='aspectFill'
              />
                  <View className='play-overlay'>
                    <View className='play-button'>
                      <Text className='play-icon'>▶</Text>
                    </View>
                  </View>
                  <View className='video-duration'>
                    <Text>点击复制链接</Text>
                  </View>
                </View>
              <View className='video-info'>
                <Text className='video-title'>{video.title}</Text>
                  <View className='video-meta'>
                <Text className='video-date'>{formatDate(video.published_at)}</Text>
              </View>
              </View>
            </View>
          ))
        )}
        </View>
      </ScrollView>
    </View>
  );
}
