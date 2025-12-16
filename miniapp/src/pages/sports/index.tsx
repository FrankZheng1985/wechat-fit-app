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

  // 计算进度
  const stepsGoal = 10000;
  const caloriesGoal = 500;
  const currentSteps = todayData?.steps || 0;
  const currentCalories = todayData?.calories || 0;
  const stepsProgress = Math.min((currentSteps / stepsGoal) * 100, 100);
  const caloriesProgress = Math.min((currentCalories / caloriesGoal) * 100, 100);

  useEffect(() => {
    // 页面加载时自动同步数据
    autoSyncWeRun();
  }, []);

  // 自动同步（静默同步，不显示loading）
  const autoSyncWeRun = async () => {
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      const sessionKey = Taro.getStorageSync('sessionKey');
      
      if (!userInfo || !sessionKey) {
        // 未登录，只获取历史记录
        fetchHistory();
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
      }
      
      // 获取历史记录
      fetchHistory();
    } catch (error) {
      console.log('Auto sync skipped:', error);
      // 自动同步失败不提示，静默处理
      fetchHistory();
    }
  };

  const fetchHistory = async () => {
    const userInfo = Taro.getStorageSync('userInfo');
    if (userInfo?.id) {
      const result = await wechatApi.getActivities(userInfo.id);
      if (result.success && result.data) {
        setHistory(result.data);
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

      const weRunData = await Taro.getWeRunData();
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
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekDays[date.getDay()]}`;
  };

  return (
    <View className='sports-page'>
      {/* 顶部进度区域 */}
      <View className='progress-hero'>
        <View className='hero-header'>
          <Text className='page-title'>Progress</Text>
          <Text className='page-subtitle'>查看你的运动数据</Text>
        </View>

        {/* 时间筛选 */}
        <View className='time-filter'>
          <View className='filter-item active'>
            <Text>7 days</Text>
          </View>
          <View className='filter-item'>
            <Text>30 days</Text>
          </View>
          <View className='filter-item'>
            <Text>90 days</Text>
          </View>
      </View>

        {/* 主环形进度 - 卡路里 */}
        <View className='main-progress'>
          <View className='progress-ring-large'>
            <View 
              className='progress-fill-outer'
              style={{ 
                background: `conic-gradient(#8B5CF6 ${caloriesProgress * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
              }}
            />
            <View 
              className='progress-fill-inner'
              style={{ 
                background: `conic-gradient(#F97316 ${stepsProgress * 3.6}deg, rgba(255,255,255,0.15) 0deg)` 
              }}
            />
            <View className='progress-center'>
              <Text className='kcal-icon'>🔥</Text>
              <Text className='progress-value'>{currentCalories}</Text>
              <Text className='progress-unit'>kcal</Text>
            </View>
          </View>
        </View>

        {/* 底部统计 */}
        <View className='stats-row'>
          <View className='stat-circle'>
            <View className='stat-ring'>
              <Text className='stat-value'>{(currentSteps / 1000).toFixed(1)}k</Text>
              <Text className='stat-label'>Steps</Text>
            </View>
          </View>
          <View className='stat-circle'>
            <View className='stat-ring purple'>
            <Text className='stat-value'>{todayData?.distance || 0}</Text>
              <Text className='stat-label'>公里</Text>
            </View>
          </View>
        </View>

        {/* 按钮组 */}
        <View className='action-buttons'>
        <Button 
            className='btn-sync'
          onClick={handleSyncWeRun}
          loading={loading}
        >
            同步运动数据
        </Button>
        </View>
      </View>

      {/* 历史记录 */}
      <View className='history-section'>
        <Text className='section-title'>历史记录</Text>
        
        {history.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-icon'>📊</Text>
            <Text className='empty-text'>暂无历史记录</Text>
            <Text className='empty-hint'>点击上方按钮同步数据</Text>
          </View>
        ) : (
          <View className='history-list'>
            {history.slice(0, 7).map((item, index) => (
              <View key={index} className='history-card'>
                <View className='history-left'>
              <Text className='history-date'>{formatDate(item.date)}</Text>
                </View>
                <View className='history-right'>
                  <View className='history-stat'>
                    <Text className='stat-icon'>👟</Text>
                    <Text className='stat-num'>{item.steps?.toLocaleString()}</Text>
                  </View>
                  <View className='history-stat'>
                    <Text className='stat-icon'>🔥</Text>
                    <Text className='stat-num'>{item.calories}</Text>
                  </View>
                  <View className='history-stat'>
                    <Text className='stat-icon'>📍</Text>
                    <Text className='stat-num'>{item.distance}km</Text>
                  </View>
                </View>
              </View>
            ))}
            </View>
        )}
      </View>
    </View>
  );
}
