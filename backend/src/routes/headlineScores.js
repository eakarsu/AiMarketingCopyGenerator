const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all headline scores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM headline_scores WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching headline scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single headline score
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM headline_scores WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Headline score not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching headline score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create headline score
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { headline, overall_score, emotional_score, power_words_score, length_score, clarity_score, seo_score, suggestions, improved_headlines, status } = req.body;
    const result = await pool.query(
      `INSERT INTO headline_scores (user_id, headline, overall_score, emotional_score, power_words_score, length_score, clarity_score, seo_score, suggestions, improved_headlines, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [req.userId, headline, overall_score, emotional_score, power_words_score, length_score, clarity_score, seo_score, suggestions, improved_headlines, status || 'completed']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating headline score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update headline score
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { headline, overall_score, emotional_score, power_words_score, length_score, clarity_score, seo_score, suggestions, improved_headlines, status } = req.body;
    const result = await pool.query(
      `UPDATE headline_scores SET headline = $1, overall_score = $2, emotional_score = $3,
       power_words_score = $4, length_score = $5, clarity_score = $6, seo_score = $7,
       suggestions = $8, improved_headlines = $9, status = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND user_id = $12 RETURNING *`,
      [headline, overall_score, emotional_score, power_words_score, length_score, clarity_score, seo_score, suggestions, improved_headlines, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Headline score not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating headline score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete headline score
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM headline_scores WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Headline score not found' });
    }
    res.json({ message: 'Headline score deleted successfully' });
  } catch (error) {
    console.error('Error deleting headline score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
