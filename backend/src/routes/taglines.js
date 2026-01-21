const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM taglines WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching taglines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM taglines WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tagline not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tagline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { brand_name, tagline, category, style, is_favorite, status } = req.body;
    const result = await pool.query(
      `INSERT INTO taglines (user_id, brand_name, tagline, category, style, is_favorite, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, brand_name, tagline, category, style, is_favorite || false, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tagline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { brand_name, tagline, category, style, is_favorite, status } = req.body;
    const result = await pool.query(
      `UPDATE taglines SET brand_name = $1, tagline = $2, category = $3,
       style = $4, is_favorite = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [brand_name, tagline, category, style, is_favorite, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tagline not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tagline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM taglines WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tagline not found' });
    }
    res.json({ message: 'Tagline deleted successfully' });
  } catch (error) {
    console.error('Error deleting tagline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
