const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all ad copies
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ad_copies WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ad copies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single ad copy
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ad_copies WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad copy not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching ad copy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create ad copy
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, platform, target_audience, tone, content, cta, status } = req.body;
    const result = await pool.query(
      `INSERT INTO ad_copies (user_id, title, platform, target_audience, tone, content, cta, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, title, platform, target_audience, tone, content, cta, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating ad copy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update ad copy
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, platform, target_audience, tone, content, cta, status } = req.body;
    const result = await pool.query(
      `UPDATE ad_copies SET title = $1, platform = $2, target_audience = $3, tone = $4,
       content = $5, cta = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title, platform, target_audience, tone, content, cta, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad copy not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ad copy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete ad copy
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM ad_copies WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad copy not found' });
    }
    res.json({ message: 'Ad copy deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad copy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
