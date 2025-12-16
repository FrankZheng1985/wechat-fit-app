import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

// 简单的管理员密码验证（生产环境应使用更安全的认证方式）
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 验证中间件
const authMiddleware = (req: any, res: any, next: any) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

// 获取统计概览
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // 用户总数
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // 今日活跃用户
    const today = new Date().toISOString().split('T')[0];
    const activeResult = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM activities WHERE date = $1',
      [today]
    );
    const activeToday = parseInt(activeResult.rows[0].count);

    // 帖子总数
    const postsResult = await pool.query('SELECT COUNT(*) as count FROM social_posts');
    const totalPosts = parseInt(postsResult.rows[0].count);

    // 今日总步数
    const stepsResult = await pool.query(
      'SELECT COALESCE(SUM(step_count), 0) as total FROM activities WHERE date = $1',
      [today]
    );
    const todaySteps = parseInt(stepsResult.rows[0].total);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeToday,
        totalPosts,
        todaySteps
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// 获取用户列表
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, openid, nickname, avatar_url, gender, interests, daily_step_goal, is_onboarded, created_at
       FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        users: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// 获取单个用户详情
router.get('/users/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 获取用户运动记录
    const activitiesResult = await pool.query(
      'SELECT * FROM activities WHERE user_id = $1 ORDER BY date DESC LIMIT 30',
      [userId]
    );

    // 获取用户帖子
    const postsResult = await pool.query(
      'SELECT * FROM social_posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        activities: activitiesResult.rows,
        posts: postsResult.rows
      }
    });
  } catch (error) {
    console.error('User detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// 获取帖子列表
router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT sp.*, u.nickname as user_nickname
       FROM social_posts sp
       LEFT JOIN users u ON sp.user_id = u.id
       ORDER BY sp.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) as count FROM social_posts');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        posts: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Posts list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// 删除帖子
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    
    await pool.query('DELETE FROM social_posts WHERE id = $1', [postId]);
    
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

// 获取运动数据排行榜
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    
    const result = await pool.query(
      `SELECT u.id, u.nickname, u.avatar_url,
              SUM(a.step_count) as total_steps,
              SUM(a.calories_burned) as total_calories,
              COUNT(a.id) as active_days
       FROM users u
       LEFT JOIN activities a ON u.id = a.user_id AND a.date >= CURRENT_DATE - $1
       GROUP BY u.id, u.nickname, u.avatar_url
       HAVING SUM(a.step_count) > 0
       ORDER BY total_steps DESC
       LIMIT 50`,
      [days]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

export default router;

