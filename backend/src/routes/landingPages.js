const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM landing_pages WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM landing_pages WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching landing page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { page_name, headline, subheadline, body_content, cta_text, cta_url, status } = req.body;
    const result = await pool.query(
      `INSERT INTO landing_pages (user_id, page_name, headline, subheadline, body_content, cta_text, cta_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, page_name, headline, subheadline, body_content, cta_text, cta_url, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating landing page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { page_name, headline, subheadline, body_content, cta_text, cta_url, status } = req.body;
    const result = await pool.query(
      `UPDATE landing_pages SET page_name = $1, headline = $2, subheadline = $3,
       body_content = $4, cta_text = $5, cta_url = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [page_name, headline, subheadline, body_content, cta_text, cta_url, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating landing page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM landing_pages WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    res.json({ message: 'Landing page deleted successfully' });
  } catch (error) {
    console.error('Error deleting landing page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
