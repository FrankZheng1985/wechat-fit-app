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
    
    // TODO: 实际项目中需要先上传图片到对象存储获取URL
    // 这里简化处理，直接使用本地路径（仅用于演示）
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

  return (
    <View className='social-page'>
      <View className='page-header'>
        <Text className='page-title'>💬 匿名树洞</Text>
        <Text className='page-desc'>分享心情，释放压力，完全匿名</Text>
      </View>

      {/* Compose Button */}
      <View 
        className='compose-fab' 
        onClick={() => setShowComposer(true)}
      >
        <Text className='fab-icon'>✏️</Text>
      </View>

      {/* Composer Modal */}
      {showComposer && (
        <View className='composer-mask' onClick={() => setShowComposer(false)}>
          <View className='composer-modal' onClick={(e) => e.stopPropagation()}>
            <View className='composer-header'>
              <Text className='composer-title'>发布心情</Text>
              <Text className='composer-close' onClick={() => setShowComposer(false)}>✕</Text>
            </View>
            <Textarea
              className='composer-input'
              placeholder='说点什么吧...'
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={500}
            />
            <View className='composer-images'>
              {images.map((img, index) => (
                <View key={index} className='image-item'>
                  <Image src={img} mode='aspectFill' className='preview-image' />
                  <Text 
                    className='remove-btn' 
                    onClick={() => handleRemoveImage(index)}
                  >✕</Text>
                </View>
              ))}
              {images.length < 9 && (
                <View className='add-image' onClick={handleChooseImage}>
                  <Text className='add-icon'>+</Text>
                </View>
              )}
            </View>
            <View className='composer-footer'>
              <Text className='anonymous-hint'>🎭 将以匿名身份发布</Text>
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

      {/* Posts List */}
      <ScrollView scrollY className='posts-list'>
        {posts.length === 0 ? (
          <View className='empty'>
            <Text className='empty-icon'>🌱</Text>
            <Text className='empty-text'>还没有内容</Text>
            <Text className='empty-hint'>成为第一个分享的人吧</Text>
          </View>
        ) : (
          posts.map(post => (
            <View key={post.id} className='post-card card'>
              <View className='post-header'>
                <Text className='anonymous-name'>🎭 {post.anonymous_name}</Text>
                <Text className='post-time'>{formatTime(post.created_at)}</Text>
              </View>
              <Text className='post-content'>{post.content}</Text>
              {post.image_urls && post.image_urls.length > 0 && (
                <View className='post-images'>
                  {post.image_urls.map((url, index) => (
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
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
