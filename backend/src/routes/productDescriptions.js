const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM product_descriptions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product descriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM product_descriptions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product description not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product description:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_name, category, short_description, long_description, key_features, seo_keywords, status } = req.body;
    const result = await pool.query(
      `INSERT INTO product_descriptions (user_id, product_name, category, short_description, long_description, key_features, seo_keywords, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, product_name, category, short_description, long_description, key_features, seo_keywords, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product description:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { product_name, category, short_description, long_description, key_features, seo_keywords, status } = req.body;
    const result = await pool.query(
      `UPDATE product_descriptions SET product_name = $1, category = $2, short_description = $3,
       long_description = $4, key_features = $5, seo_keywords = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [product_name, category, short_description, long_description, key_features, seo_keywords, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product description not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product description:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM product_descriptions WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product description not found' });
    }
    res.json({ message: 'Product description deleted successfully' });
  } catch (error) {
    console.error('Error deleting product description:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
