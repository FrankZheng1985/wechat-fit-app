import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { socialApi } from '../../services/api';
import './index.scss';

const AVATAR_COLORS = ['#FF6B35', '#3B82F6', '#10B981', '#A855F7', '#F59E0B', '#EF4444'];
const MOODS = [
  { emoji: '😊', label: '开心' },
  { emoji: '💪', label: '充实' },
  { emoji: '📚', label: '学习' },
  { emoji: '🏃', label: '运动' },
  { emoji: '😴', label: '休息' },
  { emoji: '🤔', label: '思考' },
];

export default function Social() {
  const [posts, setPosts] = useState<any[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const result = await socialApi.getPosts();
      if (result.success && result.data) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
    }
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
        content: selectedMood ? `${selectedMood} ${content}` : content,
        isAnonymous: true
      });

      if (result.success) {
        Taro.showToast({ title: '发布成功', icon: 'success' });
        setContent('');
        setSelectedMood('');
        setShowCompose(false);
        fetchPosts();
      }
    } catch (error) {
      Taro.showToast({ title: '发布失败', icon: 'none' });
    }
    setLoading(false);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <View className='social-page'>
      <View className='bg-gradient' />

      {/* 标题 */}
      <View className='page-header'>
        <Text className='page-title'>成长日记 ✍️</Text>
        <Text className='page-subtitle'>记录点滴，分享成长</Text>
      </View>

      {/* 今日心情 */}
      <View className='mood-card'>
        <Text className='mood-label'>今日心情</Text>
        <View className='mood-list'>
          {MOODS.map(mood => (
            <View 
              key={mood.emoji}
              className={`mood-item ${selectedMood === mood.emoji ? 'active' : ''}`}
              onClick={() => setSelectedMood(mood.emoji === selectedMood ? '' : mood.emoji)}
            >
              <Text className='mood-emoji'>{mood.emoji}</Text>
              <Text className='mood-text'>{mood.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 发布按钮 */}
      <View className='compose-btn' onClick={() => setShowCompose(true)}>
        <Text className='compose-icon'>✏️</Text>
        <Text className='compose-text'>写点什么...</Text>
      </View>

      {/* 帖子列表 */}
      <View className='posts-section'>
        <Text className='section-title'>大家的分享</Text>
        
        <ScrollView scrollY className='posts-list'>
          <View className='posts-list-inner'>
            {posts.length > 0 ? posts.map((post, index) => (
              <View key={index} className='post-card'>
                <View className='post-header'>
                  <View 
                    className='post-avatar'
                    style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                  >
                    <Text>{(post.anonymous_name || '匿名')[0]}</Text>
                  </View>
                  <View className='post-meta'>
                    <Text className='post-name'>{post.anonymous_name || '匿名用户'}</Text>
                    <Text className='post-time'>{formatTime(post.created_at)}</Text>
                  </View>
                </View>
                <Text className='post-content'>{post.content}</Text>
                <View className='post-actions'>
                  <View className='action-item'>
                    <Text>❤️ {post.likes || 0}</Text>
                  </View>
                  <View className='action-item'>
                    <Text>💬 {post.comments || 0}</Text>
                  </View>
                </View>
              </View>
            )) : (
              <View className='empty-state'>
                <Text className='empty-emoji'>📝</Text>
                <Text className='empty-text'>还没有内容</Text>
                <Text className='empty-hint'>快来分享你的故事吧</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* 发布弹窗 */}
      {showCompose && (
        <View className='compose-modal'>
          <View className='modal-overlay' onClick={() => setShowCompose(false)} />
          <View className='modal-content'>
            <View className='modal-header'>
              <Text className='modal-title'>写日记</Text>
              <Text className='modal-close' onClick={() => setShowCompose(false)}>✕</Text>
            </View>
            
            {selectedMood && (
              <View className='selected-mood'>
                <Text>心情：{selectedMood}</Text>
              </View>
            )}
            
            <Textarea
              className='compose-input'
              placeholder='记录今天的心情、收获、感想...'
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
