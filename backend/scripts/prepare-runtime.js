'use strict';
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../src/config/database');

async function main() {
  if (process.env.ALLOW_SCHEMA_MIGRATION !== 'true') throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  await pool.query(fs.readFileSync(path.resolve(__dirname, '../src/config/schema.sql'), 'utf8'));
  await pool.query(fs.readFileSync(path.resolve(__dirname, '../migrations/001_governed_marketing_asset_release.sql'), 'utf8'));
  await pool.query(`CREATE TABLE IF NOT EXISTS marketing_runtime_ai_results (
    id BIGSERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), input JSONB NOT NULL,
    result JSONB NOT NULL, model TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const email = String(process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '');
  if (!email || password.length < 12) throw new Error('Runtime administrator credentials are required');
  await pool.query(
    `INSERT INTO users(email,password,name,company,role) VALUES($1,$2,$3,$4,'admin')
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,company=EXCLUDED.company,role='admin',updated_at=NOW()`,
    [email, await bcrypt.hash(password, 12), 'Runtime Administrator', 'Runtime Acceptance'],
  );
}

main().catch((error) => { console.error(error.message); process.exit(1); }).finally(() => pool.end());
