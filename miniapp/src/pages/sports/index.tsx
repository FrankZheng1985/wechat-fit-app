import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useEffect, useRef } from 'react';
import { wechatApi } from '../../services/api';
import './index.scss';

const RECOMMENDED_ACTIVITIES = [
  { id: 1, name: '跑步', duration: '30分钟', calories: 280, emoji: '🏃' },
  { id: 2, name: '瑜伽', duration: '45分钟', calories: 180, emoji: '🧘' },
  { id: 3, name: '骑行', duration: '60分钟', calories: 420, emoji: '🚴' },
];

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export default function Sports() {
  const [todaySteps, setTodaySteps] = useState(2580);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0); // seconds
  const [heartRate] = useState(128);
  const [weekData, setWeekData] = useState([30, 45, 60, 35, 70, 55, 80]);
  const timerRef = useRef<any>(null);

  useDidShow(() => {
    fetchData();
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchData = async () => {
    const userInfo = Taro.getStorageSync('userInfo');
    if (!userInfo?.id) return;

    try {
      const result = await wechatApi.getActivities(userInfo.id, 7);
      if (result.success && result.data) {
        const activities = result.data;
        const today = new Date().toISOString().split('T')[0];
        const todayActivity = activities.find((a: any) => a.date === today);
        if (todayActivity) {
          setTodaySteps(todayActivity.step_count || 2580);
        }

        // 生成本周数据
        const weekSteps = WEEKDAYS.map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split('T')[0];
          const activity = activities.find((a: any) => a.date === dateStr);
          return activity ? Math.round(activity.step_count / 100) : Math.floor(Math.random() * 60) + 20;
        });
        setWeekData(weekSteps);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setIsRunning(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const maxValue = Math.max(...weekData);

  return (
    <View className='sports-page'>
      <View className='bg-gradient' />

      {/* 标题 */}
      <View className='page-header'>
        <Text className='page-title'>运动打卡 🏃</Text>
        <Text className='page-subtitle'>今天的运动量：{todaySteps.toLocaleString()} 步</Text>
      </View>

      {/* 运动计时器卡片 */}
      <View className='timer-card'>
        <View className='timer-header'>
          <View className='timer-mode'>
            <Text className='mode-icon'>⚡</Text>
            <Text className='mode-text'>燃脂模式</Text>
          </View>
          <View className='heart-rate'>
            <Text className='heart-icon'>♡</Text>
            <Text className='heart-value'>{heartRate} BPM</Text>
          </View>
        </View>
        
        <View className='timer-display'>
          <Text className='timer-value'>{formatTime(timer || 1530)}</Text>
          <Text className='timer-label'>⏱ 已运动时间</Text>
        </View>
        
        <View className='timer-btn' onClick={toggleTimer}>
          <Text className='btn-icon'>{isRunning ? '⏸' : '▷'}</Text>
          <Text className='btn-text'>{isRunning ? '暂停运动' : '开始运动'}</Text>
        </View>
      </View>

      {/* 本周运动记录 */}
      <View className='week-card'>
        <Text className='card-title'>本周运动记录</Text>
        
        <View className='chart-container'>
          <View className='chart-line'>
            {weekData.map((value, index) => (
              <View key={index} className='chart-point-wrapper'>
                <View 
                  className='chart-point'
                  style={{ bottom: `${(value / maxValue) * 100}px` }}
                />
                {index < weekData.length - 1 && (
                  <View 
                    className='chart-line-segment'
                    style={{
                      bottom: `${(value / maxValue) * 100}px`,
                      height: `${Math.abs((weekData[index + 1] - value) / maxValue) * 100}px`,
                      transform: weekData[index + 1] > value ? 'none' : 'scaleY(-1)'
                    }}
                  />
                )}
              </View>
            ))}
          </View>
          <View className='chart-labels'>
            {WEEKDAYS.map((day, index) => (
              <Text key={index} className='chart-label'>{day}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* 推荐活动 */}
      <View className='activities-section'>
        <Text className='section-title'>推荐活动</Text>
        
        <ScrollView scrollY className='activities-list'>
          <View className='activities-list-inner'>
            {RECOMMENDED_ACTIVITIES.map(activity => (
              <View key={activity.id} className='activity-card'>
                <View className='activity-left'>
                  <Text className='activity-emoji'>{activity.emoji}</Text>
                  <View className='activity-info'>
                    <Text className='activity-name'>{activity.name}</Text>
                    <Text className='activity-duration'>{activity.duration}</Text>
                  </View>
                </View>
                <View className='activity-calories'>
                  <Text className='calories-value'>{activity.calories}</Text>
                  <Text className='calories-unit'>千卡</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
