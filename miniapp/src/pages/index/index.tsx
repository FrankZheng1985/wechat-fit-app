import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { wechatApi } from '../../services/api';
import './index.scss';

export default function Index() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({ steps: 0, calories: 0 });

  useEffect(() => {
    // 尝试自动登录
    handleLogin();
  }, []);

  const handleLogin = async () => {
    try {
      const loginRes = await Taro.login();
      if (loginRes.code) {
        const result = await wechatApi.login(loginRes.code);
        if (result.success && result.data) {
          setUserInfo(result.data.user);
          Taro.setStorageSync('userInfo', result.data.user);
          Taro.setStorageSync('sessionKey', result.data.sessionKey);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View className='index-page'>
      {/* Header */}
      <View className='header'>
        <Text className='title'>运动读书</Text>
        <Text className='subtitle'>积极向上，每天进步一点点</Text>
      </View>

      {/* Today Stats */}
      <View className='stats-card card'>
        <Text className='card-title'>今日数据</Text>
        <View className='stats-row'>
          <View className='stat-item'>
            <Text className='stat-value'>{todayStats.steps}</Text>
            <Text className='stat-label'>步数</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{todayStats.calories}</Text>
            <Text className='stat-label'>卡路里</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className='actions-section'>
        <Text className='section-title'>快捷入口</Text>
        <View className='actions-grid'>
          <View 
            className='action-item' 
            onClick={() => Taro.switchTab({ url: '/pages/youtube/index' })}
          >
            <View className='action-icon book-icon'>📚</View>
            <Text className='action-text'>读书视频</Text>
          </View>
          <View 
            className='action-item'
            onClick={() => Taro.switchTab({ url: '/pages/sports/index' })}
          >
            <View className='action-icon sports-icon'>🏃</View>
            <Text className='action-text'>运动记录</Text>
          </View>
          <View 
            className='action-item'
            onClick={() => Taro.switchTab({ url: '/pages/social/index' })}
          >
            <View className='action-icon social-icon'>💬</View>
            <Text className='action-text'>匿名树洞</Text>
          </View>
        </View>
      </View>

      {/* Motivation Quote */}
      <View className='quote-card card'>
        <Text className='quote-text'>"读书使人充实，运动使人健康，分享使人快乐。"</Text>
      </View>
    </View>
  );
}
