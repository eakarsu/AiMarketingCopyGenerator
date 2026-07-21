import React, { useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const TOOLS = [
  {
    key: 'brand-voice-analyzer',
    label: 'Brand Voice Analyzer',
    icon: '🗣️',
    endpoint: '/ai/brand-voice-analyzer',
    description: 'Score brand voice alignment, identify issues, and generate a rewrite suggestion.',
    fields: [
      { key: 'content', label: 'Copy to analyze', type: 'textarea', required: true, placeholder: 'Paste the copy you want to evaluate' },
      { key: 'voiceGuidelines', label: 'Voice Guidelines', type: 'textarea', placeholder: 'Tone, register, brand personality, taboos...' },
      { key: 'brandName', label: 'Brand Name', type: 'text', placeholder: 'Optional' },
    ],
  },
  {
    key: 'competitor-comparison',
    label: 'Competitor Comparison',
    icon: '⚔️',
    endpoint: '/ai/competitor-comparison',
    description: 'Identify themes, strengths, weaknesses, differentiation angles, and recommended positioning.',
    fields: [
      { key: 'ourCopy', label: 'Our Copy', type: 'textarea', required: true, placeholder: 'Your current copy' },
      { key: 'competitorCopy', label: 'Competitor Copy', type: 'textarea', required: true, placeholder: 'Competitor copy to compare against' },
      { key: 'industry', label: 'Industry', type: 'text' },
      { key: 'goal', label: 'Comparison Goal', type: 'text', placeholder: 'e.g. find differentiation angles' },
    ],
  },
  {
    key: 'audience-sentiment',
    label: 'Audience Sentiment',
    icon: '💬',
    endpoint: '/ai/audience-sentiment',
    description: 'Predict affective, cognitive, and behavioral reactions of a target audience to the copy.',
    fields: [
      { key: 'copy', label: 'Copy to evaluate', type: 'textarea', required: true, placeholder: 'Paste the copy you want sentiment-tested' },
      { key: 'audience', label: 'Target audience', type: 'text', placeholder: 'e.g. Gen Z first-time home buyers' },
      { key: 'channel', label: 'Channel', type: 'text', placeholder: 'e.g. Instagram, email, landing page' },
      { key: 'productCategory', label: 'Product category', type: 'text', placeholder: 'Optional' },
    ],
  },
];

export default function AIToolsPage() {
  const [active, setActive] = useState(TOOLS[0].key);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const tool = TOOLS.find(t => t.key === active);

  const handleChange = (key, value) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {};
      tool.fields.forEach(f => {
        const v = inputs[f.key];
        if (v === undefined || v === '') return;
        payload[f.key] = v;
      });
      const res = await api.post(tool.endpoint, payload);
      setResult(res.data);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Request failed';
      setError(status === 503 ? `AI not configured: ${msg}` : msg);
    }
    setLoading(false);
  };

  return (
    <div className="page-container" style={{ padding: 24 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>{tool.icon} AI Marketing Tools</h1>
        <p style={{ color: '#64748b', marginTop: 6 }}>Run focused AI analyses on your marketing copy.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
        {TOOLS.map(t => (
          <div
            key={t.key}
            onClick={() => { setActive(t.key); setInputs({}); setResult(null); setError(null); }}
            style={{
              padding: 16,
              background: active === t.key ? '#6366f1' : '#fff',
              color: active === t.key ? '#fff' : '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 24 }}>{t.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{t.label}</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>{t.description}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, maxWidth: 760 }}>
        <h2 style={{ marginBottom: 4 }}>{tool.icon} {tool.label}</h2>
        <p style={{ color: '#64748b', marginBottom: 16 }}>{tool.description}</p>

        <form onSubmit={submit}>
          {tool.fields.map(field => (
            <div key={field.key} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                {field.label}{field.required ? ' *' : ''}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  rows={4}
                  value={inputs[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  required={field.required}
                  style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 4 }}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={inputs[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  required={field.required}
                  style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 4 }}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 12,
              padding: 12,
              fontSize: 15,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Running…' : `Run ${tool.label}`}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 6 }}>
            {String(error)}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <h3 style={{ marginBottom: 8 }}>Result</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontSize: 12 }}>
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
