import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

// 随机匿名昵称列表
const anonymousNames = [
  '运动小狗', '阳光跑者', '健身达人', '晨跑侠', '夜跑族',
  '瑜伽猫', '游泳鱼', '骑行侠', '登山虎', '跳绳兔',
  '深蹲熊', '俯卧撑王', '拉伸猴', '冥想鹤', '太极龟'
];

function getRandomAnonymousName(): string {
  const randomIndex = Math.floor(Math.random() * anonymousNames.length);
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${anonymousNames[randomIndex]}${randomSuffix}`;
}

// 获取帖子列表
router.get('/posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = await pool.query(
      `SELECT id, content, image_urls, anonymous_name, created_at
       FROM social_posts
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// 发布帖子
router.post('/posts', async (req, res) => {
  try {
    const { userId, content, imageUrls } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({ success: false, message: 'userId and content are required' });
    }
    
    const anonymousName = getRandomAnonymousName();
    
    const result = await pool.query(
      `INSERT INTO social_posts (user_id, content, image_urls, anonymous_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, image_urls, anonymous_name, created_at`,
      [userId, content, imageUrls || [], anonymousName]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// 删除自己的帖子
router.delete('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    const result = await pool.query(
      `DELETE FROM social_posts WHERE id = $1 AND user_id = $2 RETURNING id`,
      [postId, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Post not found or not authorized' });
    }
    
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

export default router;
