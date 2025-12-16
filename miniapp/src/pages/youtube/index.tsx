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
    // 复制链接到剪贴板
    Taro.setClipboardData({
      data: video.video_url,
      success: () => {
        Taro.showModal({
          title: '链接已复制',
          content: '由于小程序限制，无法直接播放Youtube视频。请打开浏览器粘贴链接观看。',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <View className='youtube-page'>
      <View className='page-header'>
        <Text className='page-title'>📚 读书视频</Text>
        <Text className='page-desc'>精选博主分享的读书内容</Text>
      </View>

      <ScrollView scrollY className='video-list'>
        {loading ? (
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        ) : videos.length === 0 ? (
          <View className='empty'>
            <Text className='empty-icon'>📭</Text>
            <Text className='empty-text'>暂无视频内容</Text>
            <Text className='empty-hint'>请先在后台配置Youtube频道</Text>
          </View>
        ) : (
          videos.map(video => (
            <View 
              key={video.id} 
              className='video-card card'
              onClick={() => handleVideoClick(video)}
            >
              <Image 
                className='video-thumbnail' 
                src={video.thumbnail_url} 
                mode='aspectFill'
              />
              <View className='video-info'>
                <Text className='video-title'>{video.title}</Text>
                <Text className='video-date'>{formatDate(video.published_at)}</Text>
              </View>
              <View className='video-action'>
                <Text className='action-hint'>点击复制链接</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
