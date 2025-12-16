import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { youtubeApi } from '../../services/api';
import './index.scss';

// 示例学习内容
const LEARNING_CATEGORIES = [
  { id: 'reading', name: '读书笔记', icon: '📖', color: '#FF6B35' },
  { id: 'study', name: '学习打卡', icon: '✍️', color: '#3B82F6' },
  { id: 'video', name: '视频课程', icon: '🎬', color: '#10B981' },
  { id: 'podcast', name: '播客音频', icon: '🎧', color: '#A855F7' },
];

export default function Youtube() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [todayLearning, setTodayLearning] = useState(45); // 分钟

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const result = await youtubeApi.getVideos();
      if (result.success && result.data) {
        setVideos(result.data);
      }
    } catch (error) {
      console.error('Fetch videos error:', error);
    }
    setLoading(false);
  };

  const handleVideoClick = (video: any) => {
    Taro.setClipboardData({
      data: `https://www.youtube.com/watch?v=${video.video_id}`,
      success: () => {
        Taro.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  };

  return (
    <View className='study-page'>
      <View className='bg-gradient' />

      {/* 标题 */}
      <View className='page-header'>
        <Text className='page-title'>学习中心 📚</Text>
        <Text className='page-subtitle'>每天进步一点点</Text>
      </View>

      {/* 今日学习统计 */}
      <View className='today-card'>
        <View className='today-left'>
          <Text className='today-emoji'>🎯</Text>
          <View className='today-info'>
            <Text className='today-label'>今日学习</Text>
            <View className='today-value-row'>
              <Text className='today-value'>{todayLearning}</Text>
              <Text className='today-unit'>分钟</Text>
            </View>
          </View>
        </View>
        <View className='today-btn'>
          <Text>开始学习</Text>
        </View>
      </View>

      {/* 分类 */}
      <ScrollView scrollX className='category-scroll'>
        <View className='category-list'>
          <View 
            className={`category-item ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <Text>全部</Text>
          </View>
          {LEARNING_CATEGORIES.map(cat => (
            <View 
              key={cat.id}
              className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Text>{cat.icon} {cat.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 快捷入口 */}
      <View className='quick-grid'>
        {LEARNING_CATEGORIES.map(cat => (
          <View key={cat.id} className='quick-item' style={{ background: cat.color }}>
            <Text className='quick-icon'>{cat.icon}</Text>
            <Text className='quick-name'>{cat.name}</Text>
          </View>
        ))}
      </View>

      {/* 内容列表 */}
      <View className='content-section'>
        <Text className='section-title'>推荐内容</Text>
        
        <ScrollView scrollY className='content-list'>
          <View className='content-list-inner'>
            {loading ? (
              <View className='loading-state'>
                <Text>加载中...</Text>
              </View>
            ) : videos.length > 0 ? videos.map((video, index) => (
              <View 
                key={index} 
                className='content-card'
                onClick={() => handleVideoClick(video)}
              >
                <View className='content-thumb'>
                  {video.thumbnail_url ? (
                    <Image src={video.thumbnail_url} mode='aspectFill' className='thumb-img' />
                  ) : (
                    <View className='thumb-placeholder'>
                      <Text>📺</Text>
                    </View>
                  )}
                  <View className='play-overlay'>
                    <Text>▶</Text>
                  </View>
                </View>
                <View className='content-info'>
                  <Text className='content-title' numberOfLines={2}>{video.title}</Text>
                  <Text className='content-meta'>{video.channel_name || '学习资源'}</Text>
                </View>
              </View>
            )) : (
              <View className='empty-state'>
                <Text className='empty-emoji'>📚</Text>
                <Text className='empty-text'>暂无学习内容</Text>
                <Text className='empty-hint'>下拉刷新获取更多</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
