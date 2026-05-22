import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend
} from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function colorForVariant(letter) {
  if (letter === 'A') return '#6366f1';
  if (letter === 'B') return '#10b981';
  if (letter === 'C') return '#f59e0b';
  return '#94a3b8';
}

export default function CTRComparison() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API}/custom-views/ctr-comparison`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading CTR chart...</div>;
  if (error) return <div style={{ padding: 20, color: '#dc2626' }}>Error: {error}</div>;
  if (!data.length) return <div style={{ padding: 20 }}>No CTR data available.</div>;

  const avg = data.reduce((s, d) => s + d.ctr, 0) / data.length;

  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>CTR Comparison by Variant</h2>
      <p style={{ color: '#64748b', marginBottom: 16 }}>
        Comparing click-through rate across {data.length} variants. Average CTR: <strong>{avg.toFixed(2)}%</strong>
      </p>
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: 16,
        height: 420
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              interval={0}
              height={70}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              label={{ value: 'CTR (%)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, 'CTR']}
              labelFormatter={(label) => {
                const row = data.find(d => d.name === label);
                return row ? `Campaign: ${String(row.campaign).slice(0, 40)}` : label;
              }}
            />
            <Legend
              payload={[
                { value: 'Variant A', type: 'square', color: '#6366f1' },
                { value: 'Variant B', type: 'square', color: '#10b981' },
                { value: 'Variant C', type: 'square', color: '#f59e0b' }
              ]}
            />
            <Bar dataKey="ctr" name="CTR">
              {data.map((entry, idx) => (
                <Cell key={idx} fill={colorForVariant(entry.variant)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
