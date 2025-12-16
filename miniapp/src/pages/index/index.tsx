import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { wechatApi } from '../../services/api';
import './index.scss';

export default function Index() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({ 
    steps: 0, 
    calories: 0, 
    distance: 0,
    minutes: 0 
  });
  const [greeting, setGreeting] = useState('早上好');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 设置问候语
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('早上好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');

    // 尝试自动登录并获取运动数据
    initData();
  }, []);

  const initData = async () => {
    setIsLoading(true);
    await handleLogin();
    setIsLoading(false);
  };

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
          
          // 检查是否需要引导
          const userDetail = await wechatApi.getUser(user.id);
          if (userDetail.success && userDetail.data) {
            // 如果用户未完成引导，跳转到引导页
            if (!userDetail.data.is_onboarded) {
              Taro.navigateTo({ url: '/pages/onboarding/index' });
              return;
            }
            // 更新本地用户信息
            Taro.setStorageSync('userInfo', { ...user, ...userDetail.data });
          }
          
          // 登录成功后自动获取今日运动数据
          await fetchTodayStats(user.id, result.data.sessionKey);
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // 获取今日运动数据
  const fetchTodayStats = async (userId: number, sessionKey: string) => {
    try {
      // 尝试自动同步微信运动数据
      const weRunData = await Taro.getWeRunData();
      const result = await wechatApi.syncWeRun(
        userId,
        sessionKey,
        weRunData.encryptedData,
        weRunData.iv
      );

      if (result.success && result.data) {
        const data = result.data;
        setTodayStats({
          steps: data.steps || 0,
          calories: data.calories || 0,
          distance: data.distance || 0,
          minutes: Math.round((data.steps || 0) / 100) // 估算运动时间
        });
      }
    } catch (error) {
      console.log('Auto fetch stats skipped:', error);
      // 如果获取失败，尝试从历史记录获取今日数据
      try {
        const historyResult = await wechatApi.getActivities(userId);
        if (historyResult.success && historyResult.data && historyResult.data.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todayRecord = historyResult.data.find((d: any) => d.date === today);
          if (todayRecord) {
            setTodayStats({
              steps: todayRecord.step_count || todayRecord.steps || 0,
              calories: todayRecord.calories_burned || todayRecord.calories || 0,
              distance: todayRecord.distance || 0,
              minutes: Math.round((todayRecord.step_count || todayRecord.steps || 0) / 100)
            });
          }
        }
      } catch (e) {
        console.log('Fetch history failed:', e);
      }
    }
  };

  // 计算步数进度百分比
  const stepsGoal = 10000;
  const stepsProgress = Math.min((todayStats.steps / stepsGoal) * 100, 100);

  return (
    <View className='index-page'>
      {/* 顶部 Hero 区域 */}
      <View className='hero-section'>
        <View className='hero-header'>
          <View className='user-greeting'>
            <Text className='greeting-text'>{greeting}！</Text>
            <Text className='greeting-sub'>今天也要元气满满哦 💪</Text>
          </View>
          <View className='notification-btn'>
            <Text className='notification-icon'>🔔</Text>
          </View>
        </View>

        {/* 今日目标卡片 */}
        <View className='today-goal-card'>
          <View className='goal-header'>
            <Text className='goal-title'>Today's Goal</Text>
            <Text className='goal-subtitle'>每日健康目标</Text>
      </View>

          {/* 环形进度 */}
          <View className='progress-container'>
            <View className='progress-ring-outer'>
              <View className='progress-ring-inner'>
                <View 
                  className='progress-ring-fill'
                  style={{ 
                    background: `conic-gradient(#F97316 ${stepsProgress * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
                  }}
                />
                <View className='progress-content'>
                  <Text className='progress-value'>{todayStats.steps.toLocaleString()}</Text>
                  <Text className='progress-label'>步</Text>
                  <Text className='progress-goal'>目标 {stepsGoal.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 今日统计 */}
          <View className='today-stats'>
          <View className='stat-item'>
              <View className='stat-icon fire'>🔥</View>
              <View className='stat-info'>
            <Text className='stat-value'>{todayStats.calories}</Text>
            <Text className='stat-label'>卡路里</Text>
              </View>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <View className='stat-icon distance'>📍</View>
              <View className='stat-info'>
                <Text className='stat-value'>{todayStats.distance}</Text>
                <Text className='stat-label'>公里</Text>
              </View>
            </View>
            <View className='stat-divider' />
            <View className='stat-item'>
              <View className='stat-icon time'>⏱</View>
              <View className='stat-info'>
                <Text className='stat-value'>{todayStats.minutes}</Text>
                <Text className='stat-label'>分钟</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 主要内容区 */}
      <View className='main-content'>
        {/* 快捷功能 */}
        <View className='section'>
          <Text className='section-title'>快捷功能</Text>
          <View className='quick-actions'>
          <View 
              className='action-card reading'
            onClick={() => Taro.switchTab({ url: '/pages/youtube/index' })}
          >
              <View className='action-icon-wrapper'>
                <Text className='action-icon'>📚</Text>
              </View>
              <View className='action-info'>
                <Text className='action-title'>读书视频</Text>
                <Text className='action-desc'>精选博主内容推荐</Text>
              </View>
              <View className='action-arrow'>
                <Text>→</Text>
              </View>
          </View>

            <View className='action-row'>
          <View 
                className='action-card-small sports'
            onClick={() => Taro.switchTab({ url: '/pages/sports/index' })}
          >
                <View className='action-icon'>
                  <Text>🏃</Text>
                </View>
                <Text className='action-title'>运动记录</Text>
                <Text className='action-desc'>同步微信运动</Text>
          </View>

          <View 
                className='action-card-small social'
            onClick={() => Taro.switchTab({ url: '/pages/social/index' })}
          >
                <View className='action-icon'>
                  <Text>💬</Text>
                </View>
                <Text className='action-title'>匿名树洞</Text>
                <Text className='action-desc'>分享心情</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 励志卡片 */}
        <View className='motivation-card'>
          <View className='motivation-icon'>💡</View>
          <View className='motivation-content'>
            <Text className='motivation-text'>"读书使人充实，运动使人健康，分享使人快乐。"</Text>
            <Text className='motivation-author'>— 每日一句</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
