import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function badgeColor(ctr) {
  if (ctr >= 7) return '#16a34a';
  if (ctr >= 4) return '#0891b2';
  if (ctr >= 2) return '#d97706';
  return '#dc2626';
}

export default function VariantGallery() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API}/custom-views/variants`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setVariants(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading variant gallery...</div>;
  if (error) return <div style={{ padding: 20, color: '#dc2626' }}>Error: {error}</div>;
  if (!variants.length) return <div style={{ padding: 20 }}>No variants found. Generate A/B variations first.</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>Variant Gallery</h2>
      <p style={{ color: '#64748b', marginBottom: 16 }}>
        {variants.length} copy variants across {new Set(variants.map(v => v.campaign_id)).size} campaigns.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16
      }}>
        {variants.map((v, i) => (
          <div key={i} style={{
            background: '#fff',
            border: v.recommended ? '2px solid #16a34a' : '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: badgeColor(v.ctr),
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 12
            }}>
              CTR {v.ctr}%
            </div>
            <div style={{
              fontSize: 11,
              textTransform: 'uppercase',
              color: '#64748b',
              letterSpacing: '.05em',
              marginBottom: 6
            }}>
              {v.content_type || 'Copy'} - Variant {v.variant}
              {v.recommended && <span style={{ color: '#16a34a', marginLeft: 6 }}>(recommended)</span>}
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: 8,
              paddingRight: 70
            }}>
              {v.headline}
            </div>
            <div style={{
              fontSize: 13,
              color: '#334155',
              lineHeight: 1.45,
              marginBottom: 10,
              minHeight: 40
            }}>
              {String(v.body).slice(0, 180)}{v.body && v.body.length > 180 ? '...' : ''}
            </div>
            <div style={{
              display: 'inline-block',
              background: '#eef2ff',
              color: '#4338ca',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600
            }}>
              {v.cta}
            </div>
            <div style={{
              fontSize: 11,
              color: '#94a3b8',
              marginTop: 10
            }}>
              Campaign #{v.campaign_id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
