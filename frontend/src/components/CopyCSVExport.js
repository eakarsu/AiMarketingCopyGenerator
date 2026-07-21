import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

function toCsv(rows) {
  if (!rows.length) return '';
  const cols = ['campaign_id', 'campaign', 'content_type', 'variant', 'headline', 'body', 'cta', 'ctr', 'recommended', 'created_at'];
  const header = cols.join(',');
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const body = rows.map(r => cols.map(c => escape(r[c])).join(',')).join('\n');
  return `${header}\n${body}`;
}

export default function CopyCSVExport() {
  const [data, setData] = useState({ campaigns: [], variants: [], rows: [] });
  const [campaignId, setCampaignId] = useState('all');
  const [variant, setVariant] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = (cid = campaignId, v = variant) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get(`${API}/custom-views/copy-export`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { campaign_id: cid, variant: v }
    })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { reload('all', 'all'); /* eslint-disable-line */ }, []);

  const filename = useMemo(() => {
    const parts = ['marketing-copy'];
    if (campaignId !== 'all') parts.push(`c${campaignId}`);
    if (variant !== 'all') parts.push(`v${variant}`);
    return `${parts.join('-')}.csv`;
  }, [campaignId, variant]);

  const handleDownload = () => {
    const csv = toCsv(data.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) return <div style={{ padding: 20, color: '#dc2626' }}>Error: {error}</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>Copy CSV Export</h2>
      <p style={{ color: '#64748b', marginBottom: 16 }}>
        Filter generated copy by campaign and variant, then download as CSV with full metadata.
      </p>

      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'end'
      }}>
        <div style={{ flex: '1 1 280px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Campaign</label>
          <select
            value={campaignId}
            onChange={(e) => { setCampaignId(e.target.value); reload(e.target.value, variant); }}
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }}
          >
            <option value="all">All campaigns ({data.campaigns.length})</option>
            {data.campaigns.map(c => (
              <option key={c.id} value={c.id}>#{c.id} - {c.label}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '0 0 160px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Variant</label>
          <select
            value={variant}
            onChange={(e) => { setVariant(e.target.value); reload(campaignId, e.target.value); }}
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }}
          >
            <option value="all">All variants</option>
            {data.variants.map(v => <option key={v} value={v}>Variant {v}</option>)}
          </select>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading || !data.rows.length}
          style={{
            padding: '10px 18px',
            background: data.rows.length ? '#6366f1' : '#cbd5e1',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: data.rows.length ? 'pointer' : 'not-allowed'
          }}
        >
          Download CSV ({data.rows.length})
        </button>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        overflow: 'auto',
        maxHeight: 420
      }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading...</div>
        ) : !data.rows.length ? (
          <div style={{ padding: 20, color: '#64748b' }}>No rows match the current filters.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Campaign</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Variant</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>Headline</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>CTA</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>CTR</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.slice(0, 100).map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px' }}>#{r.campaign_id}</td>
                  <td style={{ padding: '8px 12px' }}>{r.variant}</td>
                  <td style={{ padding: '8px 12px' }}>{String(r.headline).slice(0, 60)}</td>
                  <td style={{ padding: '8px 12px' }}>{r.cta}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{r.ctr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
