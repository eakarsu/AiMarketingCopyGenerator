const router = require('express').Router();

router.post('/score', (req, res) => {
  const { audiencePain = '', offer = '', proofPoints = [], cta = '' } = req.body || {};
  const words = (value) => String(value || '').toLowerCase().split(/\W+/).filter(Boolean);
  const painWords = new Set(words(audiencePain));
  const offerOverlap = words(offer).filter((word) => painWords.has(word)).length;
  const proofCount = Array.isArray(proofPoints) ? proofPoints.filter(Boolean).length : 0;
  const ctaStrength = /\b(start|book|get|try|schedule|download|claim|join)\b/i.test(cta) ? 18 : 6;
  const score = Math.min(100, Math.round(offerOverlap * 14 + proofCount * 16 + ctaStrength));
  res.json({
    feature: 'offer_message_fit',
    score,
    level: score >= 70 ? 'strong' : score >= 40 ? 'needs-tightening' : 'weak',
    suggestions: [
      offerOverlap < 2 && 'Mirror the audience pain language directly in the offer headline.',
      proofCount < 2 && 'Add concrete proof points such as outcomes, time saved, or customer segment.',
      ctaStrength < 10 && 'Use an action CTA tied to the next step, not a generic learn-more prompt.',
    ].filter(Boolean),
  });
});

module.exports = router;
