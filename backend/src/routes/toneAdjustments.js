const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all tone adjustments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tone_adjustments WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tone adjustments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single tone adjustment
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tone_adjustments WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tone adjustment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tone adjustment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create tone adjustment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { original_text, adjusted_text, original_tone, target_tone, context, confidence_score, status } = req.body;
    const result = await pool.query(
      `INSERT INTO tone_adjustments (user_id, original_text, adjusted_text, original_tone, target_tone, context, confidence_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, original_text, adjusted_text, original_tone, target_tone, context, confidence_score, status || 'completed']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tone adjustment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tone adjustment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { original_text, adjusted_text, original_tone, target_tone, context, confidence_score, status } = req.body;
    const result = await pool.query(
      `UPDATE tone_adjustments SET original_text = $1, adjusted_text = $2, original_tone = $3,
       target_tone = $4, context = $5, confidence_score = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [original_text, adjusted_text, original_tone, target_tone, context, confidence_score, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tone adjustment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tone adjustment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tone adjustment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tone_adjustments WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tone adjustment not found' });
    }
    res.json({ message: 'Tone adjustment deleted successfully' });
  } catch (error) {
    console.error('Error deleting tone adjustment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
