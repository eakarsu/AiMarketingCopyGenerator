const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const authRoutes = require('./routes/auth');
const adCopyRoutes = require('./routes/adCopies');
const emailCampaignRoutes = require('./routes/emailCampaigns');
const socialPostRoutes = require('./routes/socialPosts');
const productDescriptionRoutes = require('./routes/productDescriptions');
const blogPostRoutes = require('./routes/blogPosts');
const landingPageRoutes = require('./routes/landingPages');
const taglineRoutes = require('./routes/taglines');
const seoContentRoutes = require('./routes/seoContent');
const pressReleaseRoutes = require('./routes/pressReleases');
const videoScriptRoutes = require('./routes/videoScripts');
const seoOptimizationRoutes = require('./routes/seoOptimizations');
const toneAdjustmentRoutes = require('./routes/toneAdjustments');
const abVariationRoutes = require('./routes/abVariations');
const headlineScoreRoutes = require('./routes/headlineScores');
const localizationRoutes = require('./routes/localizations');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ad-copies', adCopyRoutes);
app.use('/api/email-campaigns', emailCampaignRoutes);
app.use('/api/social-posts', socialPostRoutes);
app.use('/api/product-descriptions', productDescriptionRoutes);
app.use('/api/blog-posts', blogPostRoutes);
app.use('/api/landing-pages', landingPageRoutes);
app.use('/api/taglines', taglineRoutes);
app.use('/api/seo-content', seoContentRoutes);
app.use('/api/press-releases', pressReleaseRoutes);
app.use('/api/video-scripts', videoScriptRoutes);
app.use('/api/seo-optimizations', seoOptimizationRoutes);
app.use('/api/tone-adjustments', toneAdjustmentRoutes);
app.use('/api/ab-variations', abVariationRoutes);
app.use('/api/headline-scores', headlineScoreRoutes);
app.use('/api/localizations', localizationRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// === BATCH 05 AUTO-MOUNT (custom feature suggestions) ===
app.use('/api/copy-optimizer-agent', require('./routes/copy-optimizer-agent'));
app.use('/api/multi-language-adapt', require('./routes/multi-language-adapt'));
app.use('/api/competitor-scrape', require('./routes/competitor-scrape'));
app.use('/api/brand-voice-enforcer', require('./routes/brand-voice-enforcer'));
app.use('/api/vertical-compliance-templates', require('./routes/vertical-compliance-templates'));

// === Batch 05 Gaps & Frontend Mounts ===
try { const _gap_brand_voice_analyzer = require('./routes/gap-brand-voice-analyzer'); app.use('/api/gap-brand-voice-analyzer', _gap_brand_voice_analyzer); } catch(e) { console.error('gap mount fail brand-voice-analyzer:', e.message); }
try { const _gap_competitor_comparison = require('./routes/gap-competitor-comparison'); app.use('/api/gap-competitor-comparison', _gap_competitor_comparison); } catch(e) { console.error('gap mount fail competitor-comparison:', e.message); }
try { const _gap_audience_sentiment = require('./routes/gap-audience-sentiment'); app.use('/api/gap-audience-sentiment', _gap_audience_sentiment); } catch(e) { console.error('gap mount fail audience-sentiment:', e.message); }
try { const _gap_cta_optimizer = require('./routes/gap-cta-optimizer'); app.use('/api/gap-cta-optimizer', _gap_cta_optimizer); } catch(e) { console.error('gap mount fail cta-optimizer:', e.message); }
try { const _gap_substantive = require('./routes/gap-substantive'); app.use('/api/gap-substantive', _gap_substantive); } catch(e) { console.error('gap mount fail substantive:', e.message); }
try { const _gap_plagiarism = require('./routes/gap-plagiarism'); app.use('/api/gap-plagiarism', _gap_plagiarism); } catch(e) { console.error('gap mount fail plagiarism:', e.message); }
try { const _gap_readability = require('./routes/gap-readability'); app.use('/api/gap-readability', _gap_readability); } catch(e) { console.error('gap mount fail readability:', e.message); }
try { const _gap_cms = require('./routes/gap-cms'); app.use('/api/gap-cms', _gap_cms); } catch(e) { console.error('gap mount fail cms:', e.message); }
try { const _gap_scheduling = require('./routes/gap-scheduling'); app.use('/api/gap-scheduling', _gap_scheduling); } catch(e) { console.error('gap mount fail scheduling:', e.message); }
try { const _gap_cross_channel = require('./routes/gap-cross-channel'); app.use('/api/gap-cross-channel', _gap_cross_channel); } catch(e) { console.error('gap mount fail cross-channel:', e.message); }
try { const _gap_collaborative = require('./routes/gap-collaborative'); app.use('/api/gap-collaborative', _gap_collaborative); } catch(e) { console.error('gap mount fail collaborative:', e.message); }
try { const _gap_style = require('./routes/gap-style'); app.use('/api/gap-style', _gap_style); } catch(e) { console.error('gap mount fail style:', e.message); }
try { const _gap_webhooks = require('./routes/gap-webhooks'); app.use('/api/gap-webhooks', _gap_webhooks); } catch(e) { console.error('gap mount fail webhooks:', e.message); }
// === End Batch 05 Mounts ===

// === Custom Views (4 endpoints: variants, ctr-comparison, copy-export, brand-profiles) ===
try {
  const customViews = require('./routes/customViews');
  app.use('/api/custom-views', customViews);
  console.log('Mounted /api/custom-views');
} catch (e) {
  console.error('Failed to mount /api/custom-views:', e.message);
}
