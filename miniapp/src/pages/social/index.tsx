import { View, Text, Textarea, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { socialApi } from '../../services/api';
import './index.scss';

interface Post {
  id: number;
  content: string;
  image_urls: string[];
  anonymous_name: string;
  created_at: string;
}

export default function SocialPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const result = await socialApi.getPosts(20, 0);
    if (result.success && result.data) {
      setPosts(result.data);
    }
  };

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      setImages([...images, ...res.tempFilePaths]);
    } catch (error) {
      console.log('Image choose cancelled');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    const userInfo = Taro.getStorageSync('userInfo');
    if (!userInfo?.id) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    setLoading(true);
    const result = await socialApi.createPost(userInfo.id, content, images);
    
    if (result.success) {
      Taro.showToast({ title: '发布成功', icon: 'success' });
      setContent('');
      setImages([]);
      setShowComposer(false);
      fetchPosts();
    } else {
      Taro.showToast({ title: result.message || '发布失败', icon: 'none' });
    }
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 生成头像颜色
  const getAvatarColor = (name: string) => {
    const colors = ['#F97316', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899', '#F59E0B'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <View className='social-page'>
      {/* 顶部区域 */}
      <View className='page-hero'>
        <View className='hero-content'>
        <Text className='page-title'>💬 匿名树洞</Text>
          <Text className='page-subtitle'>分享心情，完全匿名，释放压力</Text>
        </View>
      </View>

      {/* 发布按钮 */}
      <View 
        className='compose-fab' 
        onClick={() => setShowComposer(true)}
      >
        <Text className='fab-icon'>✏️</Text>
      </View>

      {/* 发布弹窗 */}
      {showComposer && (
        <View className='composer-overlay' onClick={() => setShowComposer(false)}>
          <View className='composer-modal' onClick={(e) => e.stopPropagation()}>
            <View className='composer-header'>
              <Text className='composer-title'>发布心情</Text>
              <View className='composer-close' onClick={() => setShowComposer(false)}>
                <Text>✕</Text>
              </View>
            </View>
            
            <Textarea
              className='composer-textarea'
              placeholder='说点什么吧，完全匿名，放心分享...'
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={500}
              autoFocus
            />
            
            {/* 图片预览 */}
            <View className='image-preview'>
              {images.map((img, index) => (
                <View key={index} className='preview-item'>
                  <Image src={img} mode='aspectFill' className='preview-image' />
                  <View 
                    className='remove-btn' 
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Text>✕</Text>
                  </View>
                </View>
              ))}
              {images.length < 9 && (
                <View className='add-image-btn' onClick={handleChooseImage}>
                  <Text className='add-icon'>+</Text>
                  <Text className='add-text'>图片</Text>
                </View>
              )}
            </View>
            
            <View className='composer-footer'>
              <View className='anonymous-badge'>
                <Text className='badge-icon'>🎭</Text>
                <Text className='badge-text'>匿名发布</Text>
              </View>
              <Button 
                className='publish-btn' 
                onClick={handlePublish}
                loading={loading}
              >
                发布
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 帖子列表 */}
      <ScrollView scrollY className='posts-container'>
        <View className='posts-inner'>
        {posts.length === 0 ? (
            <View className='empty-state'>
            <Text className='empty-icon'>🌱</Text>
              <Text className='empty-title'>还没有内容</Text>
              <Text className='empty-desc'>成为第一个分享的人吧</Text>
          </View>
        ) : (
          posts.map(post => (
              <View key={post.id} className='post-card'>
              <View className='post-header'>
                  <View 
                    className='avatar'
                    style={{ background: getAvatarColor(post.anonymous_name) }}
                  >
                    <Text className='avatar-text'>
                      {post.anonymous_name.charAt(0)}
                    </Text>
                  </View>
                  <View className='user-info'>
                    <Text className='user-name'>{post.anonymous_name}</Text>
                <Text className='post-time'>{formatTime(post.created_at)}</Text>
              </View>
                </View>
                
              <Text className='post-content'>{post.content}</Text>
                
              {post.image_urls && post.image_urls.length > 0 && (
                  <View className={`post-images count-${Math.min(post.image_urls.length, 3)}`}>
                    {post.image_urls.slice(0, 9).map((url, index) => (
                    <Image 
                      key={index} 
                      src={url} 
                      mode='aspectFill' 
                      className='post-image'
                      onClick={() => Taro.previewImage({ urls: post.image_urls, current: url })}
                    />
                  ))}
                </View>
              )}
                
                <View className='post-actions'>
                  <View className='action-item'>
                    <Text className='action-icon'>❤️</Text>
                    <Text className='action-text'>喜欢</Text>
                  </View>
                  <View className='action-item'>
                    <Text className='action-icon'>💬</Text>
                    <Text className='action-text'>评论</Text>
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
