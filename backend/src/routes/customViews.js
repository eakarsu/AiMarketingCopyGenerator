const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Ensure brand_profiles table exists
async function ensureBrandProfilesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS brand_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      brand_name VARCHAR(255) NOT NULL,
      tone VARCHAR(255),
      must_include TEXT,
      avoid_words TEXT,
      reading_level VARCHAR(100),
      voice_sample TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
ensureBrandProfilesTable().catch(err => console.error('brand_profiles init failed:', err.message));

// ----- Helpers ---------------------------------------------------------------

// Pseudo-deterministic CTR badge per variant.
// Uses ab_variation row + variant letter so the same variant always returns
// the same CTR for the session (avoids randomness drift between viz/non-viz).
function ctrFor(rowId, letter) {
  const seed = ((rowId * 73) + letter.charCodeAt(0) * 17) % 1000;
  // 0.80% - 9.79%
  return Math.round(((seed / 1000) * 9 + 0.8) * 100) / 100;
}

// Coerce an ab_variations DB row into an array of variant objects.
function rowToVariants(row) {
  const out = [];
  const letters = ['A', 'B', 'C'];
  const fields = ['variation_a', 'variation_b', 'variation_c'];
  fields.forEach((f, i) => {
    const v = row[f];
    if (!v) return;
    // headline = first non-empty line, body = next chunk, cta = last short line
    const lines = String(v).split(/\n+/).map(s => s.trim()).filter(Boolean);
    const headline = lines[0] || `Variant ${letters[i]}`;
    const cta = lines.length > 1 ? lines[lines.length - 1] : (row.test_goal || 'Learn More');
    const body = lines.length > 2 ? lines.slice(1, -1).join(' ') : (lines[1] || row.original_content || '');
    out.push({
      campaign_id: row.id,
      campaign: row.original_content ? String(row.original_content).slice(0, 60) : `Campaign ${row.id}`,
      content_type: row.content_type,
      variant: letters[i],
      headline,
      body,
      cta,
      ctr: ctrFor(row.id, letters[i]),
      recommended: row.recommended_variant === letters[i],
      created_at: row.created_at
    });
  });
  return out;
}

// ----- 1. Variant Gallery ----------------------------------------------------
router.get('/variants', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ab_variations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    const variants = result.rows.flatMap(rowToVariants);
    res.json(variants);
  } catch (err) {
    console.error('GET /variants failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----- 2. CTR Comparison Chart ----------------------------------------------
router.get('/ctr-comparison', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ab_variations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 12',
      [req.userId]
    );
    const data = result.rows.flatMap(rowToVariants).map(v => ({
      name: `#${v.campaign_id}${v.variant}`,
      campaign: v.campaign,
      variant: v.variant,
      ctr: v.ctr
    }));
    res.json(data);
  } catch (err) {
    console.error('GET /ctr-comparison failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----- 3. Copy CSV Export filter feed ---------------------------------------
// Returns the filter options + the filtered, flattened rows for the CSV.
router.get('/copy-export', authMiddleware, async (req, res) => {
  try {
    const { campaign_id, variant } = req.query;
    const result = await pool.query(
      'SELECT * FROM ab_variations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    let rows = result.rows.flatMap(rowToVariants);
    if (campaign_id && campaign_id !== 'all') {
      rows = rows.filter(r => String(r.campaign_id) === String(campaign_id));
    }
    if (variant && variant !== 'all') {
      rows = rows.filter(r => r.variant === variant);
    }
    const campaigns = result.rows.map(r => ({
      id: r.id,
      label: r.original_content ? String(r.original_content).slice(0, 60) : `Campaign ${r.id}`,
      content_type: r.content_type
    }));
    res.json({ campaigns, variants: ['A', 'B', 'C'], rows });
  } catch (err) {
    console.error('GET /copy-export failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----- 4. Brand Profiles CRUD -----------------------------------------------
router.get('/brand-profiles', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM brand_profiles WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /brand-profiles failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/brand-profiles', authMiddleware, async (req, res) => {
  try {
    const { brand_name, tone, must_include, avoid_words, reading_level, voice_sample } = req.body;
    if (!brand_name) return res.status(400).json({ error: 'brand_name is required' });
    const result = await pool.query(
      `INSERT INTO brand_profiles
        (user_id, brand_name, tone, must_include, avoid_words, reading_level, voice_sample)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, brand_name, tone, must_include, avoid_words, reading_level, voice_sample]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /brand-profiles failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/brand-profiles/:id', authMiddleware, async (req, res) => {
  try {
    const { brand_name, tone, must_include, avoid_words, reading_level, voice_sample } = req.body;
    const result = await pool.query(
      `UPDATE brand_profiles
       SET brand_name = $1, tone = $2, must_include = $3, avoid_words = $4,
           reading_level = $5, voice_sample = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [brand_name, tone, must_include, avoid_words, reading_level, voice_sample, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Brand profile not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /brand-profiles failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/brand-profiles/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM brand_profiles WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Brand profile not found' });
    res.json({ message: 'Brand profile deleted successfully' });
  } catch (err) {
    console.error('DELETE /brand-profiles failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
