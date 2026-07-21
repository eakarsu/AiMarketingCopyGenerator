import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

const EMPTY = {
  brand_name: '',
  tone: '',
  must_include: '',
  avoid_words: '',
  reading_level: '',
  voice_sample: ''
};

const READING_LEVELS = ['Grade 5', 'Grade 8', 'Grade 10', 'Grade 12', 'College'];
const TONES = ['Friendly', 'Professional', 'Witty', 'Authoritative', 'Conversational', 'Bold', 'Empathetic'];

export default function BrandProfileEditor() {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const reload = () => {
    setLoading(true);
    axios.get(`${API}/custom-views/brand-profiles`, authHeaders())
      .then(res => { setProfiles(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { reload(); }, []);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      brand_name: p.brand_name || '',
      tone: p.tone || '',
      must_include: p.must_include || '',
      avoid_words: p.avoid_words || '',
      reading_level: p.reading_level || '',
      voice_sample: p.voice_sample || ''
    });
  };

  const resetForm = () => { setForm(EMPTY); setEditingId(null); };

  const save = async () => {
    if (!form.brand_name.trim()) { setError('Brand name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await axios.put(`${API}/custom-views/brand-profiles/${editingId}`, form, authHeaders());
        setMsg('Updated brand profile');
      } else {
        await axios.post(`${API}/custom-views/brand-profiles`, form, authHeaders());
        setMsg('Created brand profile');
      }
      resetForm();
      reload();
      setTimeout(() => setMsg(null), 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this brand profile?')) return;
    try {
      await axios.delete(`${API}/custom-views/brand-profiles/${id}`, authHeaders());
      if (editingId === id) resetForm();
      reload();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const fieldStyle = { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 };

  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>Brand Profile Editor</h2>
      <p style={{ color: '#64748b', marginBottom: 16 }}>
        Manage brand voice profiles used by the copy generator. {profiles.length} profile(s) saved.
      </p>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: 10, borderRadius: 6, marginBottom: 12 }}>{error}</div>}
      {msg && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: 10, borderRadius: 6, marginBottom: 12 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? `Edit Profile #${editingId}` : 'New Profile'}</h3>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Brand Name *</label>
            <input style={fieldStyle} value={form.brand_name} onChange={onChange('brand_name')} placeholder="Acme Co" />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Tone</label>
            <select style={fieldStyle} value={form.tone} onChange={onChange('tone')}>
              <option value="">Select tone</option>
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Must-Include Phrases (comma separated)</label>
            <textarea style={{ ...fieldStyle, minHeight: 50 }} value={form.must_include} onChange={onChange('must_include')} placeholder="free shipping, 30-day guarantee" />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Avoid Words (comma separated)</label>
            <textarea style={{ ...fieldStyle, minHeight: 50 }} value={form.avoid_words} onChange={onChange('avoid_words')} placeholder="cheap, basic, ordinary" />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Reading Level</label>
            <select style={fieldStyle} value={form.reading_level} onChange={onChange('reading_level')}>
              <option value="">Select level</option>
              {READING_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Voice Sample</label>
            <textarea style={{ ...fieldStyle, minHeight: 80 }} value={form.voice_sample} onChange={onChange('voice_sample')} placeholder="Paste 2-3 sentences that capture your brand voice..." />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save} disabled={saving} style={{
              padding: '10px 16px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer'
            }}>
              {saving ? 'Saving...' : (editingId ? 'Update Profile' : 'Create Profile')}
            </button>
            {editingId && (
              <button onClick={resetForm} style={{
                padding: '10px 16px', background: '#e2e8f0', color: '#334155',
                border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer'
              }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Saved Profiles</h3>
          {loading ? (
            <div>Loading...</div>
          ) : profiles.length === 0 ? (
            <div style={{ color: '#64748b' }}>No profiles yet. Create one on the left.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflow: 'auto' }}>
              {profiles.map(p => (
                <div key={p.id} style={{
                  border: editingId === p.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.brand_name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {p.tone || 'no tone'} - {p.reading_level || 'no reading level'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(p)} style={{
                        padding: '4px 10px', background: '#eef2ff', color: '#4338ca',
                        border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer'
                      }}>Edit</button>
                      <button onClick={() => remove(p.id)} style={{
                        padding: '4px 10px', background: '#fef2f2', color: '#dc2626',
                        border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer'
                      }}>Delete</button>
                    </div>
                  </div>
                  {p.must_include && <div style={{ fontSize: 12, marginTop: 6 }}><strong>Must-include:</strong> {p.must_include}</div>}
                  {p.avoid_words && <div style={{ fontSize: 12, marginTop: 4 }}><strong>Avoid:</strong> {p.avoid_words}</div>}
                  {p.voice_sample && <div style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic', color: '#475569' }}>"{String(p.voice_sample).slice(0, 140)}{p.voice_sample.length > 140 ? '...' : ''}"</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
