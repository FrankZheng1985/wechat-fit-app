import { Router } from 'express';
import { pool } from '../config/database';
import { code2Session, decryptData, calculateCalories, calculateDistance } from '../services/wechatService';

const router = Router();

// 微信登录
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    
    const sessionData = await code2Session(code);
    if (sessionData.errcode) {
      return res.status(400).json({ success: false, message: sessionData.errmsg });
    }
    
    // 创建或更新用户
    const result = await pool.query(
      `INSERT INTO users (openid) VALUES ($1)
       ON CONFLICT (openid) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING id, openid, nickname, avatar_url`,
      [sessionData.openid]
    );
    
    res.json({
      success: true,
      data: {
        user: result.rows[0],
        sessionKey: sessionData.session_key, // 用于后续解密
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// 解密微信运动数据并保存
router.post('/werun', async (req, res) => {
  try {
    const { userId, sessionKey, encryptedData, iv } = req.body;
    
    if (!sessionKey || !encryptedData || !iv) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const decrypted = decryptData(sessionKey, encryptedData, iv);
    const stepInfoList = decrypted.stepInfoList || [];
    
    // 获取今天的步数
    const today = stepInfoList[stepInfoList.length - 1];
    if (!today) {
      return res.json({ success: true, data: { steps: 0, calories: 0, distance: 0 } });
    }
    
    const steps = today.step;
    const calories = calculateCalories(steps);
    const distance = calculateDistance(steps);
    const dateStr = new Date().toISOString().split('T')[0];
    
    // 保存到数据库
    await pool.query(
      `INSERT INTO activities (user_id, step_count, calories_burned, distance, date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, date) DO UPDATE SET
         step_count = $2, calories_burned = $3, distance = $4`,
      [userId, steps, calories, distance, dateStr]
    );
    
    res.json({
      success: true,
      data: { steps, calories, distance, date: dateStr }
    });
  } catch (error) {
    console.error('WeRun error:', error);
    res.status(500).json({ success: false, message: 'Failed to process WeRun data' });
  }
});

// 获取用户运动历史
router.get('/activities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;
    
    const result = await pool.query(
      `SELECT * FROM activities WHERE user_id = $1 ORDER BY date DESC LIMIT $2`,
      [userId, limit]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
});

// 获取用户信息
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT id, nickname, avatar_url, gender, age_range, interests, daily_step_goal, is_onboarded 
       FROM users WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// 更新用户资料（首次引导完成）
router.post('/user/profile', async (req, res) => {
  try {
    const { userId, nickname, avatarUrl, gender, ageRange, interests, dailyStepGoal } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const result = await pool.query(
      `UPDATE users SET 
        nickname = COALESCE($2, nickname),
        avatar_url = COALESCE($3, avatar_url),
        gender = COALESCE($4, gender),
        age_range = COALESCE($5, age_range),
        interests = COALESCE($6, interests),
        daily_step_goal = COALESCE($7, daily_step_goal),
        is_onboarded = TRUE,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, nickname, avatar_url, gender, age_range, interests, daily_step_goal, is_onboarded`,
      [userId, nickname, avatarUrl, gender, ageRange, interests, dailyStepGoal]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;
