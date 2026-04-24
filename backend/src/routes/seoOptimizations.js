const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all SEO optimizations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM seo_optimizations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching SEO optimizations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single SEO optimization
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM seo_optimizations WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SEO optimization not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching SEO optimization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create SEO optimization
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { original_content, optimized_content, content_type, keywords_added, readability_score, seo_score_before, seo_score_after, suggestions, status } = req.body;
    const result = await pool.query(
      `INSERT INTO seo_optimizations (user_id, original_content, optimized_content, content_type, keywords_added, readability_score, seo_score_before, seo_score_after, suggestions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.userId, original_content, optimized_content, content_type, keywords_added, readability_score, seo_score_before, seo_score_after, suggestions, status || 'completed']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating SEO optimization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update SEO optimization
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { original_content, optimized_content, content_type, keywords_added, readability_score, seo_score_before, seo_score_after, suggestions, status } = req.body;
    const result = await pool.query(
      `UPDATE seo_optimizations SET original_content = $1, optimized_content = $2, content_type = $3,
       keywords_added = $4, readability_score = $5, seo_score_before = $6, seo_score_after = $7,
       suggestions = $8, status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [original_content, optimized_content, content_type, keywords_added, readability_score, seo_score_before, seo_score_after, suggestions, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SEO optimization not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating SEO optimization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete SEO optimization
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM seo_optimizations WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SEO optimization not found' });
    }
    res.json({ message: 'SEO optimization deleted successfully' });
  } catch (error) {
    console.error('Error deleting SEO optimization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
