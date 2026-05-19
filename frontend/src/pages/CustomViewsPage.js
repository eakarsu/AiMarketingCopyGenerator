import React, { useState } from 'react';
import VariantGallery from '../components/VariantGallery';
import CTRComparison from '../components/CTRComparison';
import CopyCSVExport from '../components/CopyCSVExport';
import BrandProfileEditor from '../components/BrandProfileEditor';

const TABS = [
  { id: 'gallery', label: 'Variant Gallery', component: VariantGallery },
  { id: 'ctr', label: 'CTR Comparison', component: CTRComparison },
  { id: 'csv', label: 'Copy CSV Export', component: CopyCSVExport },
  { id: 'brand', label: 'Brand Profiles', component: BrandProfileEditor }
];

export default function CustomViewsPage() {
  const [active, setActive] = useState('gallery');
  const Active = (TABS.find(t => t.id === active) || TABS[0]).component;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 4 }}>Copy Views</h1>
        <p style={{ color: '#64748b', marginTop: 0 }}>
          Custom views for variant analysis, CTR comparison, CSV export, and brand profile management.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: 4,
        borderBottom: '2px solid #e2e8f0',
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: active === t.id ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: -2,
              color: active === t.id ? '#6366f1' : '#64748b',
              fontWeight: active === t.id ? 700 : 500,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Active />
    </div>
  );
}
