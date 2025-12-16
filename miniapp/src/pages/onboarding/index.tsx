import { View, Text, Input, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { wechatApi } from '../../services/api';
import './index.scss';

const INTERESTS_OPTIONS = [
  { id: 'running', label: '跑步', icon: '🏃' },
  { id: 'reading', label: '读书', icon: '📚' },
  { id: 'fitness', label: '健身', icon: '💪' },
  { id: 'yoga', label: '瑜伽', icon: '🧘' },
  { id: 'swimming', label: '游泳', icon: '🏊' },
  { id: 'cycling', label: '骑行', icon: '🚴' },
  { id: 'music', label: '音乐', icon: '🎵' },
  { id: 'travel', label: '旅行', icon: '✈️' },
  { id: 'cooking', label: '烹饪', icon: '🍳' },
  { id: 'photography', label: '摄影', icon: '📷' },
  { id: 'gaming', label: '游戏', icon: '🎮' },
  { id: 'meditation', label: '冥想', icon: '🧠' },
];

const STEP_GOALS = [
  { value: 5000, label: '5,000 步', desc: '轻松起步' },
  { value: 8000, label: '8,000 步', desc: '日常健康' },
  { value: 10000, label: '10,000 步', desc: '标准目标' },
  { value: 15000, label: '15,000 步', desc: '挑战自我' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gender, setGender] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [stepGoal, setStepGoal] = useState(10000);
  const [loading, setLoading] = useState(false);

  // 选择头像
  const handleChooseAvatar = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      setAvatarUrl(res.tempFilePaths[0]);
    } catch (error) {
      console.log('Avatar choose cancelled');
    }
  };

  // 切换兴趣选择
  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, id]);
    } else {
      Taro.showToast({ title: '最多选择5个兴趣', icon: 'none' });
    }
  };

  // 下一步
  const handleNext = () => {
    if (step === 1) {
      if (!nickname.trim()) {
        Taro.showToast({ title: '请输入昵称', icon: 'none' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedInterests.length === 0) {
        Taro.showToast({ title: '请至少选择1个兴趣', icon: 'none' });
        return;
      }
      setStep(3);
    }
  };

  // 完成引导
  const handleComplete = async () => {
    setLoading(true);
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      if (!userInfo?.id) {
        Taro.showToast({ title: '请先登录', icon: 'none' });
        setLoading(false);
        return;
      }

      const interestLabels = selectedInterests.map(id => 
        INTERESTS_OPTIONS.find(i => i.id === id)?.label || id
      );

      const result = await wechatApi.updateProfile({
        userId: userInfo.id,
        nickname,
        avatarUrl,
        gender,
        interests: interestLabels,
        dailyStepGoal: stepGoal
      });

      if (result.success) {
        // 更新本地存储
        Taro.setStorageSync('userInfo', { ...userInfo, ...result.data });
        Taro.showToast({ title: '设置完成！', icon: 'success' });
        
        // 跳转到首页
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/index/index' });
        }, 1500);
      } else {
        Taro.showToast({ title: result.message || '保存失败', icon: 'none' });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      Taro.showToast({ title: '保存失败', icon: 'none' });
    }
    setLoading(false);
  };

  return (
    <View className='onboarding-page'>
      {/* 进度指示器 */}
      <View className='progress-bar'>
        <View className={`progress-dot ${step >= 1 ? 'active' : ''}`} />
        <View className={`progress-line ${step >= 2 ? 'active' : ''}`} />
        <View className={`progress-dot ${step >= 2 ? 'active' : ''}`} />
        <View className={`progress-line ${step >= 3 ? 'active' : ''}`} />
        <View className={`progress-dot ${step >= 3 ? 'active' : ''}`} />
      </View>

      {/* 步骤1: 基本信息 */}
      {step === 1 && (
        <View className='step-content'>
          <View className='step-header'>
            <Text className='step-emoji'>👋</Text>
            <Text className='step-title'>欢迎加入！</Text>
            <Text className='step-subtitle'>让我们先认识一下你</Text>
          </View>

          <View className='form-section'>
            {/* 头像选择 */}
            <View className='avatar-picker' onClick={handleChooseAvatar}>
              {avatarUrl ? (
                <Image src={avatarUrl} className='avatar-image' mode='aspectFill' />
              ) : (
                <View className='avatar-placeholder'>
                  <Text className='avatar-icon'>📷</Text>
                  <Text className='avatar-text'>选择头像</Text>
                </View>
              )}
            </View>

            {/* 昵称输入 */}
            <View className='input-group'>
              <Text className='input-label'>你的昵称</Text>
              <Input
                className='input-field'
                placeholder='给自己取个名字吧'
                value={nickname}
                onInput={(e) => setNickname(e.detail.value)}
                maxlength={20}
              />
            </View>

            {/* 性别选择 */}
            <View className='input-group'>
              <Text className='input-label'>性别（可选）</Text>
              <View className='gender-options'>
                <View 
                  className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => setGender('male')}
                >
                  <Text className='gender-icon'>👨</Text>
                  <Text>男</Text>
                </View>
                <View 
                  className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => setGender('female')}
                >
                  <Text className='gender-icon'>👩</Text>
                  <Text>女</Text>
                </View>
                <View 
                  className={`gender-btn ${gender === 'other' ? 'active' : ''}`}
                  onClick={() => setGender('other')}
                >
                  <Text className='gender-icon'>🙂</Text>
                  <Text>保密</Text>
                </View>
              </View>
            </View>
          </View>

          <Button className='btn-next' onClick={handleNext}>
            下一步
          </Button>
        </View>
      )}

      {/* 步骤2: 兴趣选择 */}
      {step === 2 && (
        <View className='step-content'>
          <View className='step-header'>
            <Text className='step-emoji'>🎯</Text>
            <Text className='step-title'>你的兴趣爱好</Text>
            <Text className='step-subtitle'>选择最多5个你感兴趣的领域</Text>
          </View>

          <View className='interests-grid'>
            {INTERESTS_OPTIONS.map(interest => (
              <View
                key={interest.id}
                className={`interest-card ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest.id)}
              >
                <Text className='interest-icon'>{interest.icon}</Text>
                <Text className='interest-label'>{interest.label}</Text>
                {selectedInterests.includes(interest.id) && (
                  <View className='check-mark'>✓</View>
                )}
              </View>
            ))}
          </View>

          <View className='selected-count'>
            已选择 {selectedInterests.length}/5
          </View>

          <View className='btn-group'>
            <Button className='btn-back' onClick={() => setStep(1)}>
              上一步
            </Button>
            <Button className='btn-next' onClick={handleNext}>
              下一步
            </Button>
          </View>
        </View>
      )}

      {/* 步骤3: 目标设置 */}
      {step === 3 && (
        <View className='step-content'>
          <View className='step-header'>
            <Text className='step-emoji'>🏆</Text>
            <Text className='step-title'>设定每日目标</Text>
            <Text className='step-subtitle'>选择你的每日步数目标</Text>
          </View>

          <View className='goals-list'>
            {STEP_GOALS.map(goal => (
              <View
                key={goal.value}
                className={`goal-card ${stepGoal === goal.value ? 'selected' : ''}`}
                onClick={() => setStepGoal(goal.value)}
              >
                <View className='goal-info'>
                  <Text className='goal-value'>{goal.label}</Text>
                  <Text className='goal-desc'>{goal.desc}</Text>
                </View>
                {stepGoal === goal.value && (
                  <View className='goal-check'>✓</View>
                )}
              </View>
            ))}
          </View>

          <View className='summary-card'>
            <Text className='summary-title'>🎉 设置完成预览</Text>
            <View className='summary-item'>
              <Text className='summary-label'>昵称</Text>
              <Text className='summary-value'>{nickname}</Text>
            </View>
            <View className='summary-item'>
              <Text className='summary-label'>兴趣</Text>
              <Text className='summary-value'>
                {selectedInterests.map(id => 
                  INTERESTS_OPTIONS.find(i => i.id === id)?.icon
                ).join(' ')}
              </Text>
            </View>
            <View className='summary-item'>
              <Text className='summary-label'>目标</Text>
              <Text className='summary-value'>{stepGoal.toLocaleString()} 步/天</Text>
            </View>
          </View>

          <View className='btn-group'>
            <Button className='btn-back' onClick={() => setStep(2)}>
              上一步
            </Button>
            <Button 
              className='btn-complete' 
              onClick={handleComplete}
              loading={loading}
            >
              开始使用 🚀
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}

