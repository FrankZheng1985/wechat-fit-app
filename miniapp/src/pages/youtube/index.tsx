import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import './index.scss';

const COURSES = [
  { id: 1, name: 'React 进阶', hours: 2, progress: 75, color: '#3B82F6', emoji: '⚛️' },
  { id: 2, name: 'UI/UX 设计', hours: 1.5, progress: 45, color: '#A855F7', emoji: '🎨' },
  { id: 3, name: '英语口语', hours: 3, progress: 60, color: '#10B981', emoji: '💬' },
];

const ACHIEVEMENTS = [
  { id: 1, name: '7天连续学习', emoji: '🔥', unlocked: true },
  { id: 2, name: '学霸勋章', emoji: '🏆', unlocked: true },
  { id: 3, name: '完成10门课程', emoji: '🎓', unlocked: false },
];

export default function Study() {
  const [todayMinutes] = useState(80);
  const [todayGoal] = useState(120);
  const [weekCourses] = useState(3);
  const [weekGoal] = useState(5);
  const [totalHours] = useState(120);
  const [efficiency] = useState(95);

  return (
    <View className='study-page'>
      <View className='bg-gradient' />

      {/* 标题 */}
      <View className='page-header'>
        <Text className='page-title'>学习中心 📚</Text>
        <Text className='page-subtitle'>持续学习，终身成长</Text>
      </View>

      {/* 今日学习目标 */}
      <View className='goal-card'>
        <View className='goal-row'>
          <Text className='goal-label'>今日学习目标</Text>
          <View className='goal-value'>
            <Text className='value-current'>{todayMinutes}</Text>
            <Text className='value-divider'>/</Text>
            <Text className='value-total'>{todayGoal} 分钟</Text>
          </View>
        </View>
        <View className='progress-bar'>
          <View 
            className='progress-fill blue'
            style={{ width: `${(todayMinutes / todayGoal) * 100}%` }}
          />
        </View>
      </View>

      <View className='goal-card'>
        <View className='goal-row'>
          <Text className='goal-label'>本周完成课程</Text>
          <View className='goal-value'>
            <Text className='value-current'>{weekCourses}</Text>
            <Text className='value-divider'>/</Text>
            <Text className='value-total'>{weekGoal} 节</Text>
          </View>
        </View>
        <View className='progress-bar'>
          <View 
            className='progress-fill green'
            style={{ width: `${(weekCourses / weekGoal) * 100}%` }}
          />
        </View>
      </View>

      {/* 进行中的课程 */}
      <View className='courses-section'>
        <View className='section-header'>
          <Text className='section-title'>进行中的课程</Text>
          <Text className='section-link'>查看全部</Text>
        </View>
        
        <View className='courses-list'>
          {COURSES.map(course => (
            <View 
              key={course.id} 
              className='course-card'
              style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}CC)` }}
            >
              <Text className='course-emoji'>{course.emoji}</Text>
              <View className='course-info'>
                <Text className='course-name'>{course.name}</Text>
                <Text className='course-time'>⏱ 已学习 {course.hours}小时</Text>
                <View className='course-progress-bar'>
                  <View 
                    className='course-progress-fill'
                    style={{ width: `${course.progress}%` }}
                  />
                </View>
              </View>
              <View className='course-percent'>
                <Text className='percent-value'>{course.progress}%</Text>
                <Text className='percent-label'>完成度</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 我的成就 */}
      <View className='achievements-section'>
        <View className='section-header'>
          <Text className='section-title'>🏅 我的成就</Text>
        </View>
        
        <View className='achievements-grid'>
          {ACHIEVEMENTS.map(achievement => (
            <View 
              key={achievement.id} 
              className={`achievement-card ${!achievement.unlocked ? 'locked' : ''}`}
            >
              <Text className='achievement-emoji'>{achievement.emoji}</Text>
              <Text className='achievement-name'>{achievement.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 底部统计 */}
      <View className='stats-row'>
        <View className='stat-box'>
          <Text className='stat-icon'>📖</Text>
          <Text className='stat-label'>累计学习</Text>
          <View className='stat-value-row'>
            <Text className='stat-value'>{totalHours}</Text>
            <Text className='stat-unit'>小时</Text>
          </View>
        </View>
        <View className='stat-box'>
          <Text className='stat-icon'>📈</Text>
          <Text className='stat-label'>学习效率</Text>
          <View className='stat-value-row'>
            <Text className='stat-value'>{efficiency}%</Text>
            <Text className='stat-unit'>超越同学</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
