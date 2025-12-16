import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { socialApi } from '../../services/api';
import './index.scss';

const HOT_TOPICS = [
  { name: '#每日运动', count: '1.2k' },
  { name: '#学习打卡', count: '956' },
  { name: '#健康生活', count: '789' },
];

const CHALLENGES = [
  { id: 1, name: '30天读书', participants: 156, color: '#3B82F6', emoji: '📚' },
  { id: 2, name: '健身打卡', participants: 89, color: '#FF6B35', emoji: '💪' },
  { id: 3, name: '早起挑战', participants: 234, color: '#F59E0B', emoji: '🌅' },
];

const MOCK_POSTS = [
  { id: 1, name: '小红', time: '2分钟前', content: '刚完成跑步5公里', likes: 12, comments: 0 },
  { id: 2, name: '小李', time: '15分钟前', content: '打卡今日学习计划', likes: 8, comments: 0 },
  { id: 3, name: '小张', time: '1小时前', content: '挑战瑜伽30天 Day 7', likes: 25, comments: 0 },
];

export default function Social() {
  const [posts, setPosts] = useState<any[]>(MOCK_POSTS);
  const [showCompose, setShowCompose] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const result = await socialApi.getPosts();
      if (result.success && result.data && result.data.length > 0) {
        const formattedPosts = result.data.map((post: any, index: number) => ({
          id: post.id || index,
          name: post.anonymous_name || ['小红', '小李', '小张'][index % 3],
          time: formatTime(post.created_at),
          content: post.content,
          likes: post.likes || Math.floor(Math.random() * 30),
          comments: post.comments || 0
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
    }
  };

  const formatTime = (date: string) => {
    if (!date) return '刚刚';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const result = await socialApi.createPost({
        userId: userInfo?.id,
        content,
        isAnonymous: true
      });

      if (result.success) {
        Taro.showToast({ title: '发布成功', icon: 'success' });
        setContent('');
        setShowCompose(false);
        fetchPosts();
      }
    } catch (error) {
      Taro.showToast({ title: '发布失败', icon: 'none' });
    }
    setLoading(false);
  };

  return (
    <View className='social-page'>
      <View className='bg-gradient' />

      {/* 标题 */}
      <View className='page-header'>
        <Text className='page-title'>社区动态 👥</Text>
        <Text className='page-subtitle'>和朋友一起进步</Text>
      </View>

      {/* 热门话题 */}
      <View className='topics-card'>
        <View className='topics-header'>
          <Text className='topics-icon'>📈</Text>
          <Text className='topics-title'>热门话题</Text>
        </View>
        <View className='topics-list'>
          {HOT_TOPICS.map((topic, index) => (
            <View key={index} className='topic-item'>
              <Text className='topic-name'>{topic.name}</Text>
              <Text className='topic-count'>{topic.count} 讨论</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 朋友动态 */}
      <View className='posts-section'>
        <Text className='section-title'>朋友动态</Text>
        
        <ScrollView scrollY className='posts-list'>
          <View className='posts-list-inner'>
            {posts.map((post, index) => (
              <View key={post.id || index} className='post-card'>
                <View className='post-header'>
                  <View className='post-avatar'>
                    <Text>😊</Text>
                  </View>
                  <View className='post-meta'>
                    <Text className='post-name'>{post.name}</Text>
                    <Text className='post-time'>{post.time}</Text>
                  </View>
                </View>
                <Text className='post-content'>{post.content}</Text>
                <View className='post-actions'>
                  <View className='action-item'>
                    <Text>👍 {post.likes}</Text>
                  </View>
                  <View className='action-item'>
                    <Text>💬 评论</Text>
                  </View>
                  <View className='action-item'>
                    <Text>↗ 分享</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 热门挑战 */}
      <View className='challenges-section'>
        <View className='section-header'>
          <Text className='section-title'>热门挑战</Text>
          <Text className='section-link'>查看更多</Text>
        </View>
        
        <View className='challenges-list'>
          {CHALLENGES.map(challenge => (
            <View 
              key={challenge.id} 
              className='challenge-card'
              style={{ background: challenge.color }}
            >
              <View className='challenge-info'>
                <Text className='challenge-emoji'>{challenge.emoji}</Text>
                <View className='challenge-text'>
                  <Text className='challenge-name'>{challenge.name}</Text>
                  <Text className='challenge-count'>{challenge.participants} 人参与</Text>
                </View>
              </View>
              <View className='join-btn'>
                <Text className='join-icon'>👤+</Text>
                <Text className='join-text'>加入</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 发布按钮 */}
      <View className='compose-btn' onClick={() => setShowCompose(true)}>
        <Text>分享我的动态 ✨</Text>
      </View>

      {/* 发布弹窗 */}
      {showCompose && (
        <View className='compose-modal'>
          <View className='modal-overlay' onClick={() => setShowCompose(false)} />
          <View className='modal-content'>
            <View className='modal-header'>
              <Text className='modal-title'>分享动态</Text>
              <Text className='modal-close' onClick={() => setShowCompose(false)}>✕</Text>
            </View>
            
            <Textarea
              className='compose-input'
              placeholder='分享你的运动、学习心得...'
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={500}
              autoFocus
            />
            
            <View className='compose-footer'>
              <Text className='char-count'>{content.length}/500</Text>
              <Button 
                className='post-btn' 
                onClick={handlePost}
                loading={loading}
              >
                发布
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
