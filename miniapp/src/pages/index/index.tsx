import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { wechatApi } from '../../services/api';
import './index.scss';

const DAILY_QUOTES = [
  "每一次努力，都是在为更好的自己铺路。",
  "坚持运动，遇见更好的自己。",
  "学习是一辈子的事，今天也要加油！",
  "每天进步一点点，终会遇见不一样的自己。",
  "健康的身体是一切的基础。",
  "读书使人充实，运动使人健康。",
  "自律即自由，坚持就是胜利。",
  "今天的汗水，是明天的收获。"
];

export default function Index() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [greeting, setGreeting] = useState('你好');
  const [dailyQuote, setDailyQuote] = useState('');
  const [stats, setStats] = useState({
    consecutiveDays: 7,
    achievements: 12,
    goalCompletion: 85,
    activeDays: 30
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早上好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');

    // 每日金句
    const dayIndex = new Date().getDate() % DAILY_QUOTES.length;
    setDailyQuote(DAILY_QUOTES[dayIndex]);

    handleLogin();
  }, []);

  useDidShow(() => {
    fetchStats();
  });

  const handleLogin = async () => {
    try {
      const loginRes = await Taro.login();
      if (loginRes.code) {
        const result = await wechatApi.login(loginRes.code);
        if (result.success && result.data) {
          const user = result.data.user;
          setUserInfo(user);
          Taro.setStorageSync('userInfo', user);
          Taro.setStorageSync('sessionKey', result.data.sessionKey);

          const userDetail = await wechatApi.getUser(user.id);
          if (userDetail.success && userDetail.data) {
            if (!userDetail.data.is_onboarded) {
              Taro.navigateTo({ url: '/pages/onboarding/index' });
              return;
            }
            Taro.setStorageSync('userInfo', { ...user, ...userDetail.data });
            setUserInfo({ ...user, ...userDetail.data });
          }

          fetchStats();
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const fetchStats = async () => {
    const user = Taro.getStorageSync('userInfo');
    if (!user?.id) return;

    try {
      const result = await wechatApi.getActivities(user.id, 30);
      if (result.success && result.data) {
        const activities = result.data;
        const today = new Date().toISOString().split('T')[0];
        const todayActivity = activities.find((a: any) => a.date === today);
        
        let consecutive = 0;
        const sortedDates = activities.map((a: any) => a.date).sort().reverse();
        for (let i = 0; i < sortedDates.length; i++) {
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - i);
          if (sortedDates[i] === expectedDate.toISOString().split('T')[0]) {
            consecutive++;
          } else break;
        }

        const dailyGoal = user.daily_step_goal || 10000;
        const completion = todayActivity 
          ? Math.min(Math.round((todayActivity.step_count / dailyGoal) * 100), 100)
          : 85;

        setStats({
          consecutiveDays: consecutive || 7,
          achievements: Math.floor(activities.length / 7) || 12,
          goalCompletion: completion,
          activeDays: activities.length || 30
        });
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const navigateTo = (page: string) => {
    Taro.switchTab({ url: `/pages/${page}/index` });
  };

  const nickname = userInfo?.nickname || '小明';

  return (
    <View className='home-page'>
      <View className='bg-gradient' />
      
      {/* 问候语 */}
      <View className='greeting-section'>
        <Text className='greeting-text'>{greeting}，{nickname} 👋</Text>
        <Text className='greeting-subtitle'>今天也要元气满满哦！</Text>
      </View>

      {/* 统计卡片 */}
      <View className='stats-grid'>
        <View className='stat-card'>
          <View className='stat-icon orange'>
            <Text>🔥</Text>
          </View>
          <Text className='stat-label'>连续打卡</Text>
          <View className='stat-value-row'>
            <Text className='stat-value'>{stats.consecutiveDays}</Text>
            <Text className='stat-unit'>天</Text>
          </View>
        </View>

        <View className='stat-card'>
          <View className='stat-icon orange'>
            <Text>🏆</Text>
          </View>
          <Text className='stat-label'>成就徽章</Text>
          <View className='stat-value-row'>
            <Text className='stat-value'>{stats.achievements}</Text>
            <Text className='stat-unit'>个</Text>
          </View>
        </View>

        <View className='stat-card'>
          <View className='stat-icon blue'>
            <Text>🎯</Text>
          </View>
          <Text className='stat-label'>目标完成</Text>
          <View className='stat-value-row'>
            <Text className='stat-value'>{stats.goalCompletion}</Text>
            <Text className='stat-unit'>%</Text>
          </View>
        </View>

        <View className='stat-card'>
          <View className='stat-icon green'>
            <Text>📅</Text>
          </View>
          <Text className='stat-label'>活跃天数</Text>
          <View className='stat-value-row'>
            <Text className='stat-value'>{stats.activeDays}</Text>
            <Text className='stat-unit'>天</Text>
          </View>
        </View>
      </View>

      {/* 快捷入口 */}
      <View className='quick-section'>
        <Text className='section-title'>快捷入口</Text>
        
        <View className='quick-grid'>
          <View className='quick-card orange' onClick={() => navigateTo('sports')}>
            <Text className='quick-emoji'>🏃</Text>
            <Text className='quick-label'>开始运动</Text>
          </View>
          
          <View className='quick-card blue' onClick={() => navigateTo('youtube')}>
            <Text className='quick-emoji'>📚</Text>
            <Text className='quick-label'>学习打卡</Text>
          </View>
          
          <View className='quick-card green' onClick={() => navigateTo('sports')}>
            <Text className='quick-emoji'>👥</Text>
            <Text className='quick-label'>组队挑战</Text>
          </View>
          
          <View className='quick-card purple' onClick={() => navigateTo('social')}>
            <Text className='quick-emoji'>✍️</Text>
            <Text className='quick-label'>成长日记</Text>
          </View>
        </View>
      </View>

      {/* 每日金句 */}
      <View className='quote-card'>
        <Text className='quote-icon'>💡</Text>
        <Text className='quote-title'>每日金句</Text>
        <Text className='quote-text'>"{dailyQuote}"</Text>
      </View>
    </View>
  );
}
