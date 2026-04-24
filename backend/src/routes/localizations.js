const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all localizations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM localizations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching localizations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single localization
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM localizations WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Localization not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching localization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create localization
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { original_content, source_language, target_language, localized_content, content_type, cultural_notes, region, quality_score, status } = req.body;
    const result = await pool.query(
      `INSERT INTO localizations (user_id, original_content, source_language, target_language, localized_content, content_type, cultural_notes, region, quality_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.userId, original_content, source_language, target_language, localized_content, content_type, cultural_notes, region, quality_score, status || 'completed']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating localization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update localization
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { original_content, source_language, target_language, localized_content, content_type, cultural_notes, region, quality_score, status } = req.body;
    const result = await pool.query(
      `UPDATE localizations SET original_content = $1, source_language = $2, target_language = $3,
       localized_content = $4, content_type = $5, cultural_notes = $6, region = $7, quality_score = $8,
       status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [original_content, source_language, target_language, localized_content, content_type, cultural_notes, region, quality_score, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Localization not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating localization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete localization
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM localizations WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Localization not found' });
    }
    res.json({ message: 'Localization deleted successfully' });
  } catch (error) {
    console.error('Error deleting localization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
