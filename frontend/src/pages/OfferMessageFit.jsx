import React, { useState } from 'react';
import AIReport from '../components/AIReport';

const examples = [
  { label: 'Team launch', values: { audiencePain: 'Marketing teams spend too long rewriting launch copy across channels', offer: 'A shared launch copy workspace with brand review', proofPoints: 'Reusable briefs,approval checklist,version history', cta: 'Book a launch copy walkthrough' } },
  { label: 'Local studio', values: { audiencePain: 'Small businesses need clear product photos but have limited planning time', offer: 'A half-day product photography session with edited images', proofPoints: 'Planning call,shot list,edited image delivery', cta: 'Request a studio availability check' } },
];

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
      <div className="ai-examples" aria-label="Complete sample inputs"><span className="ai-examples-label">Fill every field:</span>{examples.map(example => <button key={example.label} type="button" className="btn-example" onClick={() => { setForm(example.values); setResult(null); }}>{example.label}</button>)}</div>
      {Object.entries(form).map(([key, value]) => (
        <div className="form-group" key={key}>
          <label>{key.replace(/([A-Z])/g, ' $1')}</label>
          <textarea value={value} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </div>
      ))}
      <button className="btn btn-primary" onClick={submit}>Score fit</button>
      {result !== null && <AIReport response={result} title="Offer message fit" />}
    </div>
  );
}
