import React, { useState } from 'react';

export default function OfferMessageFit() {
  const [form, setForm] = useState({
    audiencePain: 'teams spend too long rewriting launch copy',
    offer: 'launch copy system for teams',
    proofPoints: 'cuts review cycles,keeps brand voice consistent',
    cta: 'Book a launch copy audit',
  });
  const [result, setResult] = useState(null);

  const submit = async () => {
    const response = await fetch('/api/offer-message-fit/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify({ ...form, proofPoints: form.proofPoints.split(',').map((item) => item.trim()).filter(Boolean) }),
    });
    setResult(await response.json());
  };

  return (
    <div className="page">
      <h1>Offer Message Fit</h1>
      {Object.entries(form).map(([key, value]) => (
        <div className="form-group" key={key}>
          <label>{key.replace(/([A-Z])/g, ' $1')}</label>
          <textarea value={value} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </div>
      ))}
      <button className="btn btn-primary" onClick={submit}>Score fit</button>
      {result && <div className="card"><h2>{result.level.toUpperCase()} · {result.score}/100</h2><ul>{result.suggestions.map((item) => <li key={item}>{item}</li>)}</ul></div>}
    </div>
  );
}
