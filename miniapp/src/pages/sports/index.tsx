import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { wechatApi } from '../../services/api';
import './index.scss';

interface ActivityData {
  steps: number;
  calories: number;
  distance: number;
  date: string;
}

export default function SportsPage() {
  const [todayData, setTodayData] = useState<ActivityData | null>(null);
  const [history, setHistory] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const userInfo = Taro.getStorageSync('userInfo');
    if (userInfo?.id) {
      const result = await wechatApi.getActivities(userInfo.id);
      if (result.success && result.data) {
        setHistory(result.data);
        // 今日数据
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = result.data.find((d: ActivityData) => d.date === today);
        if (todayRecord) {
          setTodayData(todayRecord);
        }
      }
    }
  };

  const handleSyncWeRun = async () => {
    setLoading(true);
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const sessionKey = Taro.getStorageSync('sessionKey');
      
      if (!userInfo || !sessionKey) {
        Taro.showToast({ title: '请先登录', icon: 'none' });
        setLoading(false);
        return;
      }

      // 获取微信运动数据
      const weRunData = await Taro.getWeRunData();
      
      // 发送到后端解密和保存
      const result = await wechatApi.syncWeRun(
        userInfo.id,
        sessionKey,
        weRunData.encryptedData,
        weRunData.iv
      );

      if (result.success && result.data) {
        setTodayData(result.data);
        Taro.showToast({ title: '同步成功', icon: 'success' });
        fetchHistory();
      } else {
        Taro.showToast({ title: result.message || '同步失败', icon: 'none' });
      }
    } catch (error) {
      console.error('Sync error:', error);
      Taro.showToast({ title: '同步失败，请授权微信运动', icon: 'none' });
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  return (
    <View className='sports-page'>
      <View className='page-header'>
        <Text className='page-title'>🏃 运动记录</Text>
        <Text className='page-desc'>记录每一天的运动数据</Text>
      </View>

      {/* Today Stats */}
      <View className='today-card card'>
        <Text className='card-label'>今日数据</Text>
        <View className='stats-grid'>
          <View className='stat-item'>
            <Text className='stat-value'>{todayData?.steps || 0}</Text>
            <Text className='stat-label'>步数</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{todayData?.calories || 0}</Text>
            <Text className='stat-label'>卡路里</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{todayData?.distance || 0}</Text>
            <Text className='stat-label'>米</Text>
          </View>
        </View>
        <Button 
          className='sync-btn' 
          onClick={handleSyncWeRun}
          loading={loading}
        >
          同步微信运动数据
        </Button>
      </View>

      {/* History */}
      <View className='history-section'>
        <Text className='section-title'>历史记录</Text>
        {history.length === 0 ? (
          <View className='empty-history'>
            <Text>暂无历史记录，点击上方按钮同步数据</Text>
          </View>
        ) : (
          history.map((item, index) => (
            <View key={index} className='history-item card'>
              <Text className='history-date'>{formatDate(item.date)}</Text>
              <View className='history-stats'>
                <Text className='history-stat'>{item.steps} 步</Text>
                <Text className='history-stat'>{item.calories} 卡</Text>
                <Text className='history-stat'>{item.distance} 米</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
