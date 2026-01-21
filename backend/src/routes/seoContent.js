const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM seo_content WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching SEO content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM seo_content WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SEO content not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching SEO content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { page_url, meta_title, meta_description, focus_keyword, secondary_keywords, seo_score, status } = req.body;
    const result = await pool.query(
      `INSERT INTO seo_content (user_id, page_url, meta_title, meta_description, focus_keyword, secondary_keywords, seo_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, page_url, meta_title, meta_description, focus_keyword, secondary_keywords, seo_score, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating SEO content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { page_url, meta_title, meta_description, focus_keyword, secondary_keywords, seo_score, status } = req.body;
    const result = await pool.query(
      `UPDATE seo_content SET page_url = $1, meta_title = $2, meta_description = $3,
       focus_keyword = $4, secondary_keywords = $5, seo_score = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [page_url, meta_title, meta_description, focus_keyword, secondary_keywords, seo_score, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SEO content not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating SEO content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM seo_content WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SEO content not found' });
    }
    res.json({ message: 'SEO content deleted successfully' });
  } catch (error) {
    console.error('Error deleting SEO content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
