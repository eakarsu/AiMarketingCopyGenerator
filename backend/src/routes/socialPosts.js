const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM social_posts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching social posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM social_posts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Social post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching social post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { platform, content, hashtags, scheduled_date, status } = req.body;
    const result = await pool.query(
      `INSERT INTO social_posts (user_id, platform, content, hashtags, scheduled_date, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, platform, content, hashtags, scheduled_date, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating social post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { platform, content, hashtags, scheduled_date, status } = req.body;
    const result = await pool.query(
      `UPDATE social_posts SET platform = $1, content = $2, hashtags = $3,
       scheduled_date = $4, status = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [platform, content, hashtags, scheduled_date, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Social post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating social post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM social_posts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Social post not found' });
    }
    res.json({ message: 'Social post deleted successfully' });
  } catch (error) {
    console.error('Error deleting social post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
