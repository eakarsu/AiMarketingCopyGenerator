const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get all A/B variations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ab_variations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching A/B variations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single A/B variation
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ab_variations WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'A/B variation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching A/B variation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create A/B variation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { original_content, content_type, variation_a, variation_b, variation_c, hypothesis, test_goal, recommended_variant, status } = req.body;
    const result = await pool.query(
      `INSERT INTO ab_variations (user_id, original_content, content_type, variation_a, variation_b, variation_c, hypothesis, test_goal, recommended_variant, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.userId, original_content, content_type, variation_a, variation_b, variation_c, hypothesis, test_goal, recommended_variant, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating A/B variation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update A/B variation
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { original_content, content_type, variation_a, variation_b, variation_c, hypothesis, test_goal, recommended_variant, status } = req.body;
    const result = await pool.query(
      `UPDATE ab_variations SET original_content = $1, content_type = $2, variation_a = $3,
       variation_b = $4, variation_c = $5, hypothesis = $6, test_goal = $7, recommended_variant = $8,
       status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [original_content, content_type, variation_a, variation_b, variation_c, hypothesis, test_goal, recommended_variant, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'A/B variation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating A/B variation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete A/B variation
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM ab_variations WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'A/B variation not found' });
    }
    res.json({ message: 'A/B variation deleted successfully' });
  } catch (error) {
    console.error('Error deleting A/B variation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
