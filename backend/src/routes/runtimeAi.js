'use strict';
const express = require('express');
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');
const router = express.Router();

router.post('/copy-advice', authMiddleware, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || !Object.keys(req.body).length) return res.status(400).json({ error: 'campaign_context_required' });
    const { OPENROUTER_API_KEY: key, OPENROUTER_MODEL: model, OPENROUTER_BASE_URL: base } = process.env;
    if (base !== 'https://openrouter.ai/api/v1' || !key || !model) throw new Error('OpenRouter runtime configuration is incomplete');
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [
        { role: 'system', content: 'Give concise marketing-copy guidance with audience, message, CTA, and validation recommendations.' },
        { role: 'user', content: JSON.stringify(req.body) },
      ] }),
    });
    if (!response.ok) throw new Error(`OpenRouter request failed with status ${response.status}`);
    const body = await response.json();
    const result = body.choices?.[0]?.message?.content;
    if (!result) throw new Error('OpenRouter returned no usable content');
    const saved = await pool.query(
      `INSERT INTO marketing_runtime_ai_results(user_id,input,result,model)
       VALUES($1,$2::jsonb,$3::jsonb,$4) RETURNING id,created_at`,
      [req.userId, JSON.stringify(req.body), JSON.stringify({ text: result }), body.model || model],
    );
    return res.json({ success: true, result, model: body.model || model, persisted: saved.rows[0] });
  } catch (error) {
    console.error('Runtime AI error:', error.message);
    return res.status(502).json({ error: 'provider_request_failed' });
  }
});

module.exports = router;
