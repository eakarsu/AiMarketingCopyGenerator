const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM video_scripts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching video scripts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM video_scripts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video script not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching video script:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, video_type, duration_seconds, script_content, visual_notes, voiceover_text, status } = req.body;
    const result = await pool.query(
      `INSERT INTO video_scripts (user_id, title, video_type, duration_seconds, script_content, visual_notes, voiceover_text, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, title, video_type, duration_seconds, script_content, visual_notes, voiceover_text, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating video script:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, video_type, duration_seconds, script_content, visual_notes, voiceover_text, status } = req.body;
    const result = await pool.query(
      `UPDATE video_scripts SET title = $1, video_type = $2, duration_seconds = $3,
       script_content = $4, visual_notes = $5, voiceover_text = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title, video_type, duration_seconds, script_content, visual_notes, voiceover_text, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video script not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating video script:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM video_scripts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video script not found' });
    }
    res.json({ message: 'Video script deleted successfully' });
  } catch (error) {
    console.error('Error deleting video script:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
