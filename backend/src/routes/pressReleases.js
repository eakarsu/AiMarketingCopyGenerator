const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM press_releases WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching press releases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM press_releases WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Press release not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching press release:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { headline, subheadline, dateline, body, boilerplate, contact_info, status } = req.body;
    const result = await pool.query(
      `INSERT INTO press_releases (user_id, headline, subheadline, dateline, body, boilerplate, contact_info, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, headline, subheadline, dateline, body, boilerplate, contact_info, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating press release:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { headline, subheadline, dateline, body, boilerplate, contact_info, status } = req.body;
    const result = await pool.query(
      `UPDATE press_releases SET headline = $1, subheadline = $2, dateline = $3,
       body = $4, boilerplate = $5, contact_info = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [headline, subheadline, dateline, body, boilerplate, contact_info, status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Press release not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating press release:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM press_releases WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Press release not found' });
    }
    res.json({ message: 'Press release deleted successfully' });
  } catch (error) {
    console.error('Error deleting press release:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
