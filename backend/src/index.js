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
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

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
