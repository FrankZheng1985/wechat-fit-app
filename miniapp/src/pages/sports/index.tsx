import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { wechatApi } from '../../services/api';
import './index.scss';

export default function Sports() {
  const [todayData, setTodayData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userGoal, setUserGoal] = useState(10000);

  useEffect(() => {
    const userInfo = Taro.getStorageSync('userInfo');
    if (userInfo?.daily_step_goal) {
      setUserGoal(userInfo.daily_step_goal);
    }
  }, []);

  useDidShow(() => {
    fetchHistory();
    handleSyncWeRun(true);
  });

  const fetchHistory = async () => {
    const userInfo = Taro.getStorageSync('userInfo');
    if (!userInfo?.id) return;

    try {
      const result = await wechatApi.getActivities(userInfo.id, 7);
      if (result.success && result.data) {
        setHistory(result.data);
        const today = new Date().toISOString().split('T')[0];
        const todayActivity = result.data.find((a: any) => a.date === today);
        if (todayActivity) {
          setTodayData(todayActivity);
        }
      }
    } catch (error) {
      console.error('Fetch history error:', error);
    }
  };

  const handleSyncWeRun = async (silent = false) => {
    setLoading(true);
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const sessionKey = Taro.getStorageSync('sessionKey');

      if (!userInfo || !sessionKey) {
        if (!silent) Taro.showToast({ title: '请先登录', icon: 'none' });
        setLoading(false);
        return;
      }

      const weRunData = await Taro.getWeRunData();
      const result = await wechatApi.syncWeRun(
        userInfo.id,
        sessionKey,
        weRunData.encryptedData,
        weRunData.iv
      );

      if (result.success && result.data) {
        setTodayData(result.data);
        if (!silent) Taro.showToast({ title: '同步成功', icon: 'success' });
        fetchHistory();
      }
    } catch (error) {
      console.error('Sync error:', error);
      if (!silent) Taro.showToast({ title: '请授权微信运动', icon: 'none' });
    }
    setLoading(false);
  };

  const steps = todayData?.step_count || 0;
  const calories = todayData?.calories_burned || Math.round(steps * 0.04);
  const distance = todayData?.distance || (steps * 0.7 / 1000).toFixed(1);
  const progress = Math.min((steps / userGoal) * 100, 100);

  const getProgressColor = () => {
    if (progress >= 100) return '#10B981';
    if (progress >= 60) return '#F59E0B';
    return '#3B82F6';
  };

  return (
    <View className='sports-page'>
      <View className='bg-gradient' />
      
      {/* 标题 */}
      <View className='page-header'>
        <Text className='page-title'>运动统计 🏃</Text>
        <Text className='page-subtitle'>记录每一步，见证每一天</Text>
      </View>

      {/* 主进度卡片 */}
      <View className='main-card'>
        <View className='progress-ring'>
          <View className='ring-bg'>
            <View 
              className='ring-progress' 
              style={{ 
                background: `conic-gradient(${getProgressColor()} ${progress * 3.6}deg, #E5E7EB ${progress * 3.6}deg)` 
              }}
            />
            <View className='ring-inner'>
              <Text className='ring-value'>{steps.toLocaleString()}</Text>
              <Text className='ring-label'>步</Text>
            </View>
          </View>
        </View>
        
        <View className='stats-row'>
          <View className='stat-item'>
            <Text className='stat-icon'>🔥</Text>
            <Text className='stat-value'>{calories}</Text>
            <Text className='stat-label'>卡路里</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-icon'>📍</Text>
            <Text className='stat-value'>{distance}</Text>
            <Text className='stat-label'>公里</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-icon'>🎯</Text>
            <Text className='stat-value'>{Math.round(progress)}%</Text>
            <Text className='stat-label'>目标</Text>
          </View>
        </View>

        <View 
          className={`sync-btn ${loading ? 'loading' : ''}`} 
          onClick={() => !loading && handleSyncWeRun()}
        >
          <Text>{loading ? '同步中...' : '🔄 同步数据'}</Text>
        </View>
      </View>

      {/* 历史记录 */}
      <View className='history-section'>
        <Text className='section-title'>历史记录</Text>
        
        <ScrollView scrollY className='history-list'>
          <View className='history-list-inner'>
            {history.length > 0 ? history.map((item, index) => (
              <View key={index} className='history-card'>
                <View className='history-date'>
                  <Text className='date-day'>
                    {new Date(item.date).getDate()}
                  </Text>
                  <Text className='date-month'>
                    {new Date(item.date).getMonth() + 1}月
                  </Text>
                </View>
                <View className='history-info'>
                  <Text className='history-steps'>
                    {item.step_count?.toLocaleString() || 0} 步
                  </Text>
                  <View className='history-bar'>
                    <View 
                      className='history-bar-fill'
                      style={{ 
                        width: `${Math.min((item.step_count / userGoal) * 100, 100)}%`,
                        background: item.step_count >= userGoal ? '#10B981' : '#3B82F6'
                      }}
                    />
                  </View>
                </View>
                {item.step_count >= userGoal && (
                  <Text className='history-badge'>🎉</Text>
                )}
              </View>
            )) : (
              <View className='empty-state'>
                <Text className='empty-emoji'>📊</Text>
                <Text className='empty-text'>暂无运动记录</Text>
                <Text className='empty-hint'>点击同步获取微信运动数据</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
