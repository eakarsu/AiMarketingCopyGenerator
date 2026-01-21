const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM email_campaigns WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM email_campaigns WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email campaign not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching email campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, campaign_type, target_segment, body, preview_text, status } = req.body;
    const result = await pool.query(
      `INSERT INTO email_campaigns (user_id, subject, campaign_type, target_segment, body, preview_text, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, subject, campaign_type, target_segment, body, preview_text, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating email campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { subject, campaign_type, target_segment, body, preview_text, status } = req.body;
    const result = await pool.query(
      `UPDATE email_campaigns SET subject = $1, campaign_type = $2, target_segment = $3,
       body = $4, preview_text = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [subject, campaign_type, target_segment, body, preview_text, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email campaign not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating email campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM email_campaigns WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email campaign not found' });
    }
    res.json({ message: 'Email campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting email campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
