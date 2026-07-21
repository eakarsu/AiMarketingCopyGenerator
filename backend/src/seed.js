const pool = require('./config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true') throw new Error('Demo seed is disabled outside an explicitly approved non-production database.');
const demoEmail = String(process.env.DEMO_EMAIL || '').trim().toLowerCase();
const demoPassword = String(process.env.DEMO_PASSWORD || '');
if (!demoEmail || demoPassword.length < 12) throw new Error('DEMO_EMAIL and a 12+ character DEMO_PASSWORD are required.');

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Starting database seed...');

    // Drop all tables and recreate from schema
    await client.query('DROP TABLE IF EXISTS localizations, headline_scores, ab_variations, tone_adjustments, seo_optimizations, video_scripts, press_releases, seo_content, taglines, landing_pages, blog_posts, product_descriptions, social_posts, email_campaigns, ad_copies, users CASCADE');
    console.log('Dropped existing tables');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('Schema created successfully');

    // Clear existing data (including new tables)
    await client.query('TRUNCATE users, ad_copies, email_campaigns, social_posts, product_descriptions, blog_posts, landing_pages, taglines, seo_content, press_releases, video_scripts, seo_optimizations, tone_adjustments, ab_variations, headline_scores, localizations RESTART IDENTITY CASCADE');
    console.log('Cleared existing data');

    // Create demo user
    const hashedPassword = await bcrypt.hash(demoPassword, 12);
    const userResult = await client.query(
      'INSERT INTO users (email, password, name, company, role, phone, bio) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [demoEmail, hashedPassword, 'Runtime Administrator', 'AI Marketing Co', 'admin', '+1 (555) 123-4567', 'Marketing professional with 10+ years of experience in digital advertising and content strategy.']
    );
    const userId = userResult.rows[0].id;
    console.log('Demo user created');

    // Seed Ad Copies (15 items)
    const adCopies = [
      { title: 'Summer Sale Blast', platform: 'Facebook', target_audience: 'Millennials 25-35', tone: 'Exciting', content: 'Hot summer deals are here! Save up to 50% on all items. Limited time only!', cta: 'Shop Now', status: 'published' },
      { title: 'Premium Quality Awaits', platform: 'Google Ads', target_audience: 'Professionals 30-50', tone: 'Professional', content: 'Discover premium quality products that match your lifestyle. Excellence in every detail.', cta: 'Explore Collection', status: 'published' },
      { title: 'Flash Deal Alert', platform: 'Instagram', target_audience: 'Gen Z 18-24', tone: 'Urgent', content: '24 HOURS ONLY! Grab these deals before they vanish. Your cart is waiting!', cta: 'Get Deal', status: 'draft' },
      { title: 'Tech Innovation Launch', platform: 'LinkedIn', target_audience: 'Tech Executives', tone: 'Informative', content: 'Introducing the future of productivity. Our new AI-powered solution transforms workflows.', cta: 'Learn More', status: 'published' },
      { title: 'Wellness Journey Starts', platform: 'TikTok', target_audience: 'Health-conscious 20-40', tone: 'Friendly', content: 'Your wellness journey begins here. Natural ingredients, real results, happy you!', cta: 'Try Free', status: 'draft' },
      { title: 'Business Growth Solutions', platform: 'LinkedIn', target_audience: 'Small Business Owners', tone: 'Professional', content: 'Scale your business with proven strategies. Join thousands of successful entrepreneurs.', cta: 'Start Growing', status: 'published' },
      { title: 'Weekend Special Offer', platform: 'Facebook', target_audience: 'Families', tone: 'Friendly', content: 'Make this weekend special! Family bundles at unbeatable prices. Create memories together.', cta: 'View Offers', status: 'published' },
      { title: 'Exclusive Member Access', platform: 'Instagram', target_audience: 'Luxury Shoppers', tone: 'Exclusive', content: 'For members only. Unlock exclusive access to our premium collection before anyone else.', cta: 'Join VIP', status: 'draft' },
      { title: 'Back to School Savings', platform: 'Google Ads', target_audience: 'Parents', tone: 'Helpful', content: 'Get ready for school! Everything you need at prices you will love. Quality guaranteed.', cta: 'Shop Essentials', status: 'published' },
      { title: 'Fitness Goals Achieved', platform: 'TikTok', target_audience: 'Fitness Enthusiasts', tone: 'Motivating', content: 'Your fitness goals are within reach. Premium equipment, expert guidance, amazing results.', cta: 'Start Today', status: 'published' },
      { title: 'Home Makeover Time', platform: 'Facebook', target_audience: 'Homeowners 30-55', tone: 'Inspiring', content: 'Transform your space into your dream home. Beautiful designs, affordable prices.', cta: 'Get Inspired', status: 'draft' },
      { title: 'Career Advancement Program', platform: 'LinkedIn', target_audience: 'Career Professionals', tone: 'Professional', content: 'Accelerate your career with industry-leading certifications. Learn from the best.', cta: 'Enroll Now', status: 'published' },
      { title: 'Pet Parent Paradise', platform: 'Instagram', target_audience: 'Pet Owners', tone: 'Friendly', content: 'Because your furry friend deserves the best. Premium pet products with love.', cta: 'Shop for Pets', status: 'published' },
      { title: 'Sustainable Living', platform: 'Facebook', target_audience: 'Eco-conscious Consumers', tone: 'Thoughtful', content: 'Make a difference with every purchase. Eco-friendly products for a better tomorrow.', cta: 'Go Green', status: 'draft' },
      { title: 'Gaming Experience Upgrade', platform: 'TikTok', target_audience: 'Gamers 16-35', tone: 'Exciting', content: 'Level up your gaming setup! Next-gen gear for the ultimate experience. Game on!', cta: 'Upgrade Now', status: 'published' }
    ];
    for (const ad of adCopies) {
      await client.query(
        'INSERT INTO ad_copies (user_id, title, platform, target_audience, tone, content, cta, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, ad.title, ad.platform, ad.target_audience, ad.tone, ad.content, ad.cta, ad.status]
      );
    }
    console.log('Seeded 15 ad copies');

    // Seed Email Campaigns (15 items)
    const emailCampaigns = [
      { subject: 'Welcome to the Family!', campaign_type: 'Welcome', target_segment: 'New Subscribers', body: 'Welcome aboard! We are thrilled to have you with us.', preview_text: 'Your journey begins now', status: 'sent' },
      { subject: 'Your Weekly Digest', campaign_type: 'Newsletter', target_segment: 'All Subscribers', body: 'This week: Top stories and tips just for you.', preview_text: 'Catch up on what you missed', status: 'scheduled' },
      { subject: 'Flash Sale - 48 Hours Only!', campaign_type: 'Promotional', target_segment: 'Active Customers', body: 'Our biggest sale starts now. Do not miss out!', preview_text: 'Up to 60% off everything', status: 'sent' },
      { subject: 'We Miss You!', campaign_type: 'Re-engagement', target_segment: 'Inactive Users', body: 'Come back and see what is new. Special surprise waiting.', preview_text: 'Special offer just for you', status: 'draft' },
      { subject: 'Your Order Has Shipped!', campaign_type: 'Transactional', target_segment: 'Recent Buyers', body: 'Great news! Your order is on its way.', preview_text: 'Track your package now', status: 'sent' },
      { subject: 'Exclusive Early Access', campaign_type: 'Promotional', target_segment: 'VIP Members', body: 'As a VIP, you get first access to our new collection.', preview_text: 'VIP early access starts now', status: 'sent' },
      { subject: 'Monthly Product Updates', campaign_type: 'Newsletter', target_segment: 'Product Users', body: 'Exciting updates this month! New features inside.', preview_text: 'See what is new', status: 'scheduled' },
      { subject: 'Complete Your Purchase', campaign_type: 'Re-engagement', target_segment: 'Cart Abandoners', body: 'Your cart is waiting. Free shipping today only!', preview_text: 'Your cart misses you', status: 'sent' },
      { subject: 'Thank You for Your Purchase!', campaign_type: 'Transactional', target_segment: 'Recent Buyers', body: 'Thank you for shopping with us!', preview_text: 'Order confirmed', status: 'sent' },
      { subject: 'Birthday Surprise Inside!', campaign_type: 'Promotional', target_segment: 'Birthday Month', body: 'Happy Birthday! 25% off your next purchase!', preview_text: 'Your birthday gift awaits', status: 'scheduled' },
      { subject: 'Industry Insights Report', campaign_type: 'Newsletter', target_segment: 'Business Subscribers', body: 'Your monthly industry report is here.', preview_text: 'Monthly insights report', status: 'sent' },
      { subject: 'Account Security Update', campaign_type: 'Transactional', target_segment: 'All Users', body: 'Important security update for your account.', preview_text: 'Important account info', status: 'sent' },
      { subject: 'Refer a Friend, Get Rewarded', campaign_type: 'Promotional', target_segment: 'Loyal Customers', body: 'Share the love! Both get $20 off.', preview_text: 'Earn rewards by sharing', status: 'draft' },
      { subject: 'Last Chance - Sale Ends Tonight!', campaign_type: 'Promotional', target_segment: 'All Subscribers', body: 'Final hours! Sale ends at midnight.', preview_text: 'Hours left to save', status: 'sent' },
      { subject: 'New Year, New You', campaign_type: 'Newsletter', target_segment: 'Health Subscribers', body: 'Start the year right with our wellness guide.', preview_text: 'Your wellness guide', status: 'scheduled' }
    ];
    for (const email of emailCampaigns) {
      await client.query(
        'INSERT INTO email_campaigns (user_id, subject, campaign_type, target_segment, body, preview_text, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, email.subject, email.campaign_type, email.target_segment, email.body, email.preview_text, email.status]
      );
    }
    console.log('Seeded 15 email campaigns');

    // Seed Social Posts (15 items)
    const socialPosts = [
      { platform: 'Instagram', content: 'New arrivals are HERE! Shop the latest trends. Link in bio!', hashtags: '#NewArrivals #Fashion #ShopNow', status: 'published' },
      { platform: 'Twitter', content: 'Big announcement coming tomorrow! Stay tuned...', hashtags: '#ComingSoon #Announcement', status: 'scheduled' },
      { platform: 'LinkedIn', content: 'Thrilled to announce our partnership with industry leaders.', hashtags: '#Partnership #Innovation', status: 'published' },
      { platform: 'Facebook', content: 'Happy Friday! Share your weekend plans below!', hashtags: '#FridayVibes #Giveaway', status: 'published' },
      { platform: 'TikTok', content: 'POV: When you finally find the perfect product.', hashtags: '#POV #Viral #MustHave', status: 'draft' },
      { platform: 'Instagram', content: 'Behind the scenes of our latest photoshoot!', hashtags: '#BTS #BehindTheScenes', status: 'published' },
      { platform: 'Twitter', content: 'Quick tip: Post when your audience is most active!', hashtags: '#SocialMediaTips #Marketing', status: 'published' },
      { platform: 'LinkedIn', content: 'Leadership is about taking care of those in your charge.', hashtags: '#Leadership #Management', status: 'published' },
      { platform: 'Facebook', content: 'Customer spotlight! Thank you for sharing your story.', hashtags: '#CustomerStory #Testimonial', status: 'published' },
      { platform: 'TikTok', content: '3 life hacks you NEED to know! Watch till the end!', hashtags: '#LifeHacks #Tips #Viral', status: 'published' },
      { platform: 'Instagram', content: 'Self-care Sunday. What is your favorite way to unwind?', hashtags: '#SelfCareSunday #Wellness', status: 'scheduled' },
      { platform: 'Twitter', content: 'Our team just hit a major milestone! Thank you all!', hashtags: '#Milestone #TeamWork', status: 'published' },
      { platform: 'LinkedIn', content: 'The future of work is hybrid. Here are 5 strategies.', hashtags: '#RemoteWork #FutureOfWork', status: 'published' },
      { platform: 'Facebook', content: 'Flash poll! Which new product should we launch next?', hashtags: '#Poll #NewProduct', status: 'draft' },
      { platform: 'TikTok', content: 'Day in my life as a small business owner.', hashtags: '#SmallBusiness #DayInMyLife', status: 'published' }
    ];
    for (const post of socialPosts) {
      await client.query(
        'INSERT INTO social_posts (user_id, platform, content, hashtags, status) VALUES ($1, $2, $3, $4, $5)',
        [userId, post.platform, post.content, post.hashtags, post.status]
      );
    }
    console.log('Seeded 15 social posts');

    // Seed Product Descriptions (15 items)
    const productDescriptions = [
      { product_name: 'ProMax Wireless Headphones', category: 'Electronics', short_description: 'Premium wireless headphones with 30-hour battery.', long_description: 'Experience audio perfection with active noise cancellation.', key_features: '- Active Noise Cancellation\n- 30-hour battery', seo_keywords: 'wireless headphones, noise cancelling', status: 'published' },
      { product_name: 'EcoSmart Water Bottle', category: 'Lifestyle', short_description: 'Insulated stainless steel bottle, 24-hour cold.', long_description: 'Stay hydrated sustainably with premium materials.', key_features: '- Double-wall insulation\n- BPA-free', seo_keywords: 'insulated bottle, eco-friendly', status: 'published' },
      { product_name: 'SmartFit Fitness Tracker', category: 'Wearables', short_description: 'Advanced fitness tracker with heart rate monitoring.', long_description: 'Take control of your health with 24/7 tracking.', key_features: '- Heart rate monitoring\n- Sleep tracking', seo_keywords: 'fitness tracker, health wearable', status: 'published' },
      { product_name: 'Organic Face Serum', category: 'Beauty', short_description: 'Nourishing serum with vitamin C and hyaluronic acid.', long_description: 'Reveal your natural radiance with organic ingredients.', key_features: '- Vitamin C brightening\n- 95% organic', seo_keywords: 'organic serum, vitamin c', status: 'published' },
      { product_name: 'Executive Leather Briefcase', category: 'Accessories', short_description: 'Handcrafted genuine leather with laptop compartment.', long_description: 'Make a statement with timeless elegance.', key_features: '- Full-grain leather\n- 15-inch laptop fit', seo_keywords: 'leather briefcase, laptop bag', status: 'published' },
      { product_name: 'Smart Home Hub', category: 'Electronics', short_description: 'Central control for all smart devices with voice.', long_description: 'Transform your house into a smart home.', key_features: '- Voice control\n- 1000+ devices', seo_keywords: 'smart home, voice control', status: 'draft' },
      { product_name: 'Yoga Mat Pro', category: 'Fitness', short_description: 'Extra-thick eco-friendly mat with alignment markers.', long_description: 'Elevate your practice with superior cushioning.', key_features: '- 6mm thickness\n- Alignment markers', seo_keywords: 'yoga mat, exercise mat', status: 'published' },
      { product_name: 'Gourmet Coffee Maker', category: 'Kitchen', short_description: 'Programmable with built-in grinder and thermal carafe.', long_description: 'Start your mornings with the freshest coffee.', key_features: '- Built-in grinder\n- Programmable timer', seo_keywords: 'coffee maker, coffee grinder', status: 'published' },
      { product_name: 'Kids Learning Tablet', category: 'Electronics', short_description: 'Educational tablet with parental controls.', long_description: 'Inspire young minds with educational apps.', key_features: '- Parental controls\n- Drop-proof case', seo_keywords: 'kids tablet, educational', status: 'published' },
      { product_name: 'Portable Power Station', category: 'Electronics', short_description: 'High-capacity 500Wh for camping and emergencies.', long_description: 'Never be without power with solar charging.', key_features: '- 500Wh capacity\n- Solar compatible', seo_keywords: 'portable power, camping', status: 'draft' },
      { product_name: 'Ergonomic Office Chair', category: 'Furniture', short_description: 'Adjustable with lumbar support and breathable mesh.', long_description: 'Work in comfort all day with spine support.', key_features: '- Lumbar support\n- Breathable mesh', seo_keywords: 'ergonomic chair, office chair', status: 'published' },
      { product_name: 'Wireless Charging Pad', category: 'Electronics', short_description: 'Fast 15W charging for all Qi-enabled devices.', long_description: 'Cut the cord with sleek wireless charging.', key_features: '- 15W fast charging\n- Case-friendly', seo_keywords: 'wireless charger, Qi charger', status: 'published' },
      { product_name: 'Natural Soy Candle Set', category: 'Home', short_description: 'Set of 3 hand-poured with essential oil fragrances.', long_description: 'Create ambiance with 100% natural soy wax.', key_features: '- Natural soy wax\n- 45-hour burn', seo_keywords: 'soy candles, aromatherapy', status: 'published' },
      { product_name: 'Travel Backpack', category: 'Travel', short_description: 'Expandable 35L-45L with TSA-friendly laptop compartment.', long_description: 'Adventure awaits with water-resistant fabric.', key_features: '- Expandable\n- TSA-friendly', seo_keywords: 'travel backpack, laptop bag', status: 'published' },
      { product_name: 'Plant-Based Protein Powder', category: 'Health', short_description: 'Organic with 25g protein per serving.', long_description: 'Fuel your fitness with complete amino acids.', key_features: '- 25g protein\n- Organic ingredients', seo_keywords: 'plant protein, vegan protein', status: 'published' }
    ];
    for (const product of productDescriptions) {
      await client.query(
        'INSERT INTO product_descriptions (user_id, product_name, category, short_description, long_description, key_features, seo_keywords, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, product.product_name, product.category, product.short_description, product.long_description, product.key_features, product.seo_keywords, product.status]
      );
    }
    console.log('Seeded 15 product descriptions');

    // Seed Blog Posts (15 items)
    const blogPosts = [
      { title: '10 Marketing Trends to Watch in 2024', slug: 'marketing-trends-2024', category: 'Marketing', meta_description: 'Discover top marketing trends for 2024.', content: '## Introduction\n\nThe marketing landscape is evolving rapidly...', tags: 'marketing, trends, AI', word_count: 1500, seo_score: 92, status: 'published' },
      { title: 'Complete Guide to Email Marketing', slug: 'email-marketing-guide', category: 'Email Marketing', meta_description: 'Master email marketing with our guide.', content: '## Why Email Marketing Matters\n\nEmail has the highest ROI...', tags: 'email marketing, automation', word_count: 2200, seo_score: 88, status: 'published' },
      { title: 'Social Media Strategy for Small Business', slug: 'social-media-strategy', category: 'Social Media', meta_description: 'Create effective social media strategies.', content: '## Starting With Strategy\n\nBefore posting, you need a clear strategy...', tags: 'social media, small business', word_count: 1800, seo_score: 85, status: 'published' },
      { title: 'SEO Best Practices for 2024', slug: 'seo-best-practices-2024', category: 'SEO', meta_description: 'Stay ahead with SEO best practices.', content: '## The SEO Landscape Has Changed\n\nGoogle updates mean old tactics do not work...', tags: 'SEO, search optimization', word_count: 1600, seo_score: 95, status: 'published' },
      { title: 'Creating Content That Converts', slug: 'content-that-converts', category: 'Content Marketing', meta_description: 'Create content that drives conversions.', content: '## Understanding Your Audience\n\nGreat content starts with knowing your audience...', tags: 'content marketing, copywriting', word_count: 1400, seo_score: 87, status: 'published' },
      { title: 'Building a Brand from Scratch', slug: 'building-brand-scratch', category: 'Branding', meta_description: 'Step-by-step brand building guide.', content: '## What is a Brand?\n\nA brand is more than just a logo...', tags: 'branding, brand identity', word_count: 1900, seo_score: 82, status: 'draft' },
      { title: 'The Power of Video Marketing', slug: 'power-of-video-marketing', category: 'Video Marketing', meta_description: 'Discover why video marketing is essential.', content: '## Video is King\n\nVideo generates 1200% more shares...', tags: 'video marketing, YouTube', word_count: 1700, seo_score: 89, status: 'published' },
      { title: 'Mastering Google Ads', slug: 'mastering-google-ads', category: 'Paid Advertising', meta_description: 'Complete Google Ads guide.', content: '## Getting Started with Google Ads\n\nPaid search can transform your business...', tags: 'Google Ads, PPC', word_count: 2500, seo_score: 91, status: 'published' },
      { title: 'Customer Retention Strategies', slug: 'customer-retention-strategies', category: 'Customer Success', meta_description: 'Keep customers coming back.', content: '## Why Retention Beats Acquisition\n\nIt costs 5x more to acquire new customers...', tags: 'customer retention, loyalty', word_count: 1300, seo_score: 84, status: 'published' },
      { title: 'Influencer Marketing Guide', slug: 'influencer-marketing-guide', category: 'Influencer Marketing', meta_description: 'Partner with influencers effectively.', content: '## The Rise of Influencer Marketing\n\nInfluencers have changed brand connections...', tags: 'influencer marketing, social proof', word_count: 1600, seo_score: 86, status: 'published' },
      { title: 'Analytics for Marketers', slug: 'analytics-for-marketers', category: 'Analytics', meta_description: 'Make data-driven decisions.', content: '## Why Data Matters\n\nData-driven marketers achieve competitive advantage...', tags: 'analytics, data', word_count: 2000, seo_score: 88, status: 'published' },
      { title: 'Copywriting That Sells', slug: 'copywriting-that-sells', category: 'Copywriting', meta_description: 'Master persuasive copywriting.', content: '## The Psychology of Persuasion\n\nGreat copy taps into psychology...', tags: 'copywriting, persuasion', word_count: 1800, seo_score: 90, status: 'published' },
      { title: 'Marketing Automation 101', slug: 'marketing-automation-101', category: 'Automation', meta_description: 'Beginners guide to automation.', content: '## What is Marketing Automation?\n\nAutomate repetitive tasks...', tags: 'automation, marketing tools', word_count: 1500, seo_score: 83, status: 'draft' },
      { title: 'Local SEO for Service Businesses', slug: 'local-seo-service', category: 'Local SEO', meta_description: 'Dominate local search results.', content: '## Why Local SEO is Different\n\nLocal search has unique ranking factors...', tags: 'local SEO, Google Business', word_count: 1400, seo_score: 93, status: 'published' },
      { title: 'A/B Testing for Beginners', slug: 'ab-testing-beginners', category: 'Optimization', meta_description: 'Run effective A/B tests.', content: '## Why A/B Testing Works\n\nStop guessing, start testing...', tags: 'A/B testing, CRO', word_count: 1200, seo_score: 85, status: 'published' }
    ];
    for (const post of blogPosts) {
      await client.query(
        'INSERT INTO blog_posts (user_id, title, slug, category, meta_description, content, tags, word_count, seo_score, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [userId, post.title, post.slug, post.category, post.meta_description, post.content, post.tags, post.word_count, post.seo_score, post.status]
      );
    }
    console.log('Seeded 15 blog posts');

    // Seed Landing Pages (15 items)
    const landingPages = [
      { page_name: 'Free Trial Signup', headline: 'Start Your 14-Day Free Trial', subheadline: 'No credit card required', body_content: 'Join 10,000+ businesses.', cta_text: 'Start Free Trial', cta_url: '/signup', conversion_rate: 4.5, status: 'published' },
      { page_name: 'Product Launch', headline: 'Introducing the Future', subheadline: 'The all-in-one tool', body_content: 'Finally, a solution that works.', cta_text: 'Get Early Access', cta_url: '/early-access', conversion_rate: 6.2, status: 'published' },
      { page_name: 'Webinar Registration', headline: 'Free Masterclass: Scale Your Business', subheadline: 'Learn from experts', body_content: 'In 60 minutes, learn strategies.', cta_text: 'Reserve Your Spot', cta_url: '/webinar', conversion_rate: 8.1, status: 'published' },
      { page_name: 'E-book Download', headline: 'The Ultimate Digital Marketing Guide', subheadline: '50+ pages of strategies', body_content: 'Download and learn.', cta_text: 'Download Free', cta_url: '/ebook', conversion_rate: 12.3, status: 'published' },
      { page_name: 'Demo Request', headline: 'See Our Platform in Action', subheadline: 'Personalized demo', body_content: 'Get a custom walkthrough.', cta_text: 'Schedule Demo', cta_url: '/demo', conversion_rate: 3.8, status: 'published' },
      { page_name: 'Black Friday Sale', headline: '50% Off Everything', subheadline: 'Limited time only', body_content: 'Incredible deals inside.', cta_text: 'Claim Discount', cta_url: '/black-friday', conversion_rate: 9.7, status: 'draft' },
      { page_name: 'Case Study', headline: 'How Company X Grew 300%', subheadline: 'Real results', body_content: 'Learn how they did it.', cta_text: 'Read Case Study', cta_url: '/case-study', conversion_rate: 5.2, status: 'published' },
      { page_name: 'Newsletter Signup', headline: 'Get Weekly Marketing Insights', subheadline: 'Join 50,000+ marketers', body_content: 'Expert tips every week.', cta_text: 'Subscribe Now', cta_url: '/newsletter', conversion_rate: 15.6, status: 'published' },
      { page_name: 'Pricing Page', headline: 'Simple, Transparent Pricing', subheadline: 'Choose your plan', body_content: 'All plans include support.', cta_text: 'Get Started', cta_url: '/pricing', conversion_rate: 2.9, status: 'published' },
      { page_name: 'Partner Program', headline: 'Earn 30% Commission', subheadline: 'Join our partner program', body_content: 'High commissions, great support.', cta_text: 'Become a Partner', cta_url: '/partners', conversion_rate: 4.1, status: 'published' },
      { page_name: 'Mobile App', headline: 'Take Your Business Anywhere', subheadline: 'Award-winning app', body_content: 'Full functionality on mobile.', cta_text: 'Download App', cta_url: '/app', conversion_rate: 7.3, status: 'published' },
      { page_name: 'Enterprise Solution', headline: 'Enterprise-Grade Solutions', subheadline: 'Custom for your needs', body_content: 'Advanced security and support.', cta_text: 'Contact Sales', cta_url: '/enterprise', conversion_rate: 2.1, status: 'published' },
      { page_name: 'Comparison Page', headline: 'See How We Compare', subheadline: 'The clear choice', body_content: 'Better features, lower price.', cta_text: 'Try Us Free', cta_url: '/compare', conversion_rate: 5.8, status: 'draft' },
      { page_name: 'Career Page', headline: 'Join Our Growing Team', subheadline: 'Build the future', body_content: 'Remote-first culture.', cta_text: 'View Positions', cta_url: '/careers', conversion_rate: 3.4, status: 'published' },
      { page_name: 'Coming Soon', headline: 'Something Amazing is Coming', subheadline: 'Be the first to know', body_content: 'Get exclusive early access.', cta_text: 'Notify Me', cta_url: '/notify', conversion_rate: 11.2, status: 'published' }
    ];
    for (const page of landingPages) {
      await client.query(
        'INSERT INTO landing_pages (user_id, page_name, headline, subheadline, body_content, cta_text, cta_url, conversion_rate, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [userId, page.page_name, page.headline, page.subheadline, page.body_content, page.cta_text, page.cta_url, page.conversion_rate, page.status]
      );
    }
    console.log('Seeded 15 landing pages');

    // Seed Taglines (15 items)
    const taglines = [
      { brand_name: 'TechFlow', tagline: 'Innovation flows through everything', category: 'Technology', style: 'Inspiring', is_favorite: true, status: 'active' },
      { brand_name: 'GreenEarth', tagline: 'For a future worth living', category: 'Sustainability', style: 'Thoughtful', is_favorite: true, status: 'active' },
      { brand_name: 'SpeedyDeliver', tagline: 'There before you know it', category: 'Logistics', style: 'Confident', is_favorite: false, status: 'active' },
      { brand_name: 'HealthPlus', tagline: 'Your wellness, our passion', category: 'Healthcare', style: 'Caring', is_favorite: true, status: 'active' },
      { brand_name: 'LuxuryStay', tagline: 'Where every moment matters', category: 'Hospitality', style: 'Elegant', is_favorite: false, status: 'active' },
      { brand_name: 'FinanceWise', tagline: 'Smart money, smarter future', category: 'Finance', style: 'Professional', is_favorite: true, status: 'active' },
      { brand_name: 'FitLife', tagline: 'Stronger every day', category: 'Fitness', style: 'Motivating', is_favorite: false, status: 'draft' },
      { brand_name: 'EduLearn', tagline: 'Knowledge without limits', category: 'Education', style: 'Empowering', is_favorite: true, status: 'active' },
      { brand_name: 'FoodieDelight', tagline: 'Taste the difference', category: 'Food & Beverage', style: 'Appetizing', is_favorite: false, status: 'active' },
      { brand_name: 'AutoDrive', tagline: 'The road to tomorrow', category: 'Automotive', style: 'Bold', is_favorite: false, status: 'active' },
      { brand_name: 'PetPals', tagline: 'Because they are family', category: 'Pet Care', style: 'Warm', is_favorite: true, status: 'active' },
      { brand_name: 'SecureGuard', tagline: 'Protection you can trust', category: 'Security', style: 'Reassuring', is_favorite: false, status: 'active' },
      { brand_name: 'BeautyGlow', tagline: 'Reveal your radiance', category: 'Beauty', style: 'Elegant', is_favorite: true, status: 'active' },
      { brand_name: 'CloudSync', tagline: 'Your data, everywhere', category: 'Technology', style: 'Modern', is_favorite: false, status: 'draft' },
      { brand_name: 'TravelWise', tagline: 'Adventures await', category: 'Travel', style: 'Adventurous', is_favorite: true, status: 'active' }
    ];
    for (const tagline of taglines) {
      await client.query(
        'INSERT INTO taglines (user_id, brand_name, tagline, category, style, is_favorite, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, tagline.brand_name, tagline.tagline, tagline.category, tagline.style, tagline.is_favorite, tagline.status]
      );
    }
    console.log('Seeded 15 taglines');

    // Seed SEO Content (15 items)
    const seoContent = [
      { page_url: '/products/headphones', meta_title: 'Premium Wireless Headphones | ProMax', meta_description: 'Discover ProMax wireless headphones with noise cancellation.', focus_keyword: 'wireless headphones', secondary_keywords: 'noise cancelling, bluetooth', seo_score: 92, status: 'active' },
      { page_url: '/services/marketing', meta_title: 'Digital Marketing Services | Grow Your Business', meta_description: 'Full-service digital marketing agency with SEO and PPC.', focus_keyword: 'digital marketing services', secondary_keywords: 'SEO services, PPC', seo_score: 88, status: 'active' },
      { page_url: '/about', meta_title: 'About Us - Our Story | Company Name', meta_description: 'Learn about our journey and mission.', focus_keyword: 'about company', secondary_keywords: 'our story, mission', seo_score: 75, status: 'active' },
      { page_url: '/blog', meta_title: 'Marketing Blog | Tips & Insights', meta_description: 'Stay updated with marketing tips and trends.', focus_keyword: 'marketing blog', secondary_keywords: 'marketing tips, trends', seo_score: 85, status: 'active' },
      { page_url: '/contact', meta_title: 'Contact Us | Get in Touch', meta_description: 'Contact our team today. We respond within 24 hours.', focus_keyword: 'contact us', secondary_keywords: 'customer support', seo_score: 70, status: 'active' },
      { page_url: '/pricing', meta_title: 'Pricing Plans | Affordable Solutions', meta_description: 'Transparent pricing with no hidden fees.', focus_keyword: 'pricing plans', secondary_keywords: 'subscription, free trial', seo_score: 82, status: 'active' },
      { page_url: '/features', meta_title: 'Features | Powerful Tools', meta_description: 'Explore our comprehensive feature set.', focus_keyword: 'product features', secondary_keywords: 'automation, analytics', seo_score: 79, status: 'draft' },
      { page_url: '/testimonials', meta_title: 'Customer Reviews | Success Stories', meta_description: 'Read what our customers say about us.', focus_keyword: 'customer testimonials', secondary_keywords: 'reviews, success stories', seo_score: 77, status: 'active' },
      { page_url: '/faq', meta_title: 'FAQ | Frequently Asked Questions', meta_description: 'Find answers to common questions.', focus_keyword: 'frequently asked questions', secondary_keywords: 'FAQ, help', seo_score: 73, status: 'active' },
      { page_url: '/careers', meta_title: 'Careers | Job Openings', meta_description: 'Explore career opportunities with us.', focus_keyword: 'careers', secondary_keywords: 'jobs, hiring', seo_score: 80, status: 'active' },
      { page_url: '/integrations', meta_title: 'Integrations | Connect Your Tools', meta_description: 'Integrate with 100+ popular tools.', focus_keyword: 'software integrations', secondary_keywords: 'app connections, API', seo_score: 84, status: 'active' },
      { page_url: '/resources', meta_title: 'Free Resources | Guides & Templates', meta_description: 'Download free marketing resources.', focus_keyword: 'free resources', secondary_keywords: 'templates, guides', seo_score: 86, status: 'active' },
      { page_url: '/webinars', meta_title: 'Free Webinars | Learn From Experts', meta_description: 'Register for upcoming webinars.', focus_keyword: 'marketing webinars', secondary_keywords: 'free webinars, training', seo_score: 81, status: 'active' },
      { page_url: '/partners', meta_title: 'Partner Program | Earn Commission', meta_description: 'Join our partner program.', focus_keyword: 'partner program', secondary_keywords: 'affiliate, commission', seo_score: 78, status: 'draft' },
      { page_url: '/security', meta_title: 'Security & Compliance | Data Safe', meta_description: 'Enterprise-grade security with SOC 2.', focus_keyword: 'data security', secondary_keywords: 'GDPR, encryption', seo_score: 83, status: 'active' }
    ];
    for (const seo of seoContent) {
      await client.query(
        'INSERT INTO seo_content (user_id, page_url, meta_title, meta_description, focus_keyword, secondary_keywords, seo_score, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, seo.page_url, seo.meta_title, seo.meta_description, seo.focus_keyword, seo.secondary_keywords, seo.seo_score, seo.status]
      );
    }
    console.log('Seeded 15 SEO content items');

    // Seed Press Releases (15 items)
    const pressReleases = [
      { headline: 'TechCorp Announces AI Platform', subheadline: 'Transforms business productivity', dateline: 'SAN FRANCISCO, Jan 15, 2024', body: 'TechCorp today announced its groundbreaking AI platform.', boilerplate: 'TechCorp is a leading technology company.', contact_info: 'press@techcorp.com', status: 'published' },
      { headline: 'GreenEnergy Secures $50M Funding', subheadline: 'Accelerates sustainable solutions', dateline: 'AUSTIN, Feb 1, 2024', body: 'GreenEnergy completed its $50 million Series B.', boilerplate: 'GreenEnergy pioneers renewable solutions.', contact_info: 'media@greenenergy.com', status: 'published' },
      { headline: 'HealthTech Partners with Hospital Network', subheadline: 'Improves patient outcomes', dateline: 'BOSTON, Feb 10, 2024', body: 'HealthTech announced a strategic partnership.', boilerplate: 'HealthTech improves healthcare through tech.', contact_info: 'communications@healthtech.com', status: 'published' },
      { headline: 'RetailMax Opens 100th Store', subheadline: 'National expansion milestone', dateline: 'CHICAGO, Feb 20, 2024', body: 'RetailMax celebrates with its 100th location.', boilerplate: 'RetailMax is a leading retail chain.', contact_info: 'pr@retailmax.com', status: 'published' },
      { headline: 'FinanceApp Reaches 1 Million Users', subheadline: 'Personal finance app growth', dateline: 'NEW YORK, Mar 1, 2024', body: 'FinanceApp reached 1 million active users.', boilerplate: 'FinanceApp makes finance simple.', contact_info: 'press@financeapp.com', status: 'published' },
      { headline: 'AutoDrive Unveils Self-Driving Tech', subheadline: 'Next-gen autonomous system', dateline: 'DETROIT, Mar 15, 2024', body: 'AutoDrive unveiled its latest self-driving tech.', boilerplate: 'AutoDrive leads autonomous development.', contact_info: 'media@autodrive.com', status: 'draft' },
      { headline: 'EduLearn Launches Free Courses', subheadline: 'Democratizes education access', dateline: 'SEATTLE, Mar 25, 2024', body: 'EduLearn launched 100 free online courses.', boilerplate: 'EduLearn makes education accessible.', contact_info: 'press@edulearn.com', status: 'published' },
      { headline: 'FoodDelivery Expands to 50 Cities', subheadline: 'Major service expansion', dateline: 'LOS ANGELES, Apr 5, 2024', body: 'FoodDelivery announced expansion to 50 new cities.', boilerplate: 'FoodDelivery connects customers to restaurants.', contact_info: 'pr@fooddelivery.com', status: 'published' },
      { headline: 'SecurityFirst Achieves SOC 2', subheadline: 'Validates security practices', dateline: 'WASHINGTON DC, Apr 15, 2024', body: 'SecurityFirst achieved SOC 2 Type II certification.', boilerplate: 'SecurityFirst provides enterprise security.', contact_info: 'media@securityfirst.com', status: 'published' },
      { headline: 'TravelWise Introduces AI Planner', subheadline: 'Personalized trip itineraries', dateline: 'MIAMI, Apr 25, 2024', body: 'TravelWise launched an AI-powered trip planner.', boilerplate: 'TravelWise makes travel planning easy.', contact_info: 'press@travelwise.com', status: 'published' },
      { headline: 'CloudStore Launches Enterprise Platform', subheadline: 'Targets large businesses', dateline: 'DENVER, May 1, 2024', body: 'CloudStore launched its enterprise cloud platform.', boilerplate: 'CloudStore provides secure cloud storage.', contact_info: 'enterprise@cloudstore.com', status: 'published' },
      { headline: 'FitTech Acquires Wellness Startup', subheadline: 'Strengthens fitness portfolio', dateline: 'SAN DIEGO, May 10, 2024', body: 'FitTech announced acquisition of WellnessNow.', boilerplate: 'FitTech helps people live healthier.', contact_info: 'communications@fittech.com', status: 'draft' },
      { headline: 'MediaGroup Wins Excellence Award', subheadline: 'Outstanding content creation', dateline: 'NEW YORK, May 20, 2024', body: 'MediaGroup received the Industry Excellence Award.', boilerplate: 'MediaGroup creates engaging content.', contact_info: 'press@mediagroup.com', status: 'published' },
      { headline: 'SmartHome Releases Next-Gen Hub', subheadline: 'Supports Matter protocol', dateline: 'PORTLAND, Jun 1, 2024', body: 'SmartHome released its next-generation hub.', boilerplate: 'SmartHome creates connected home solutions.', contact_info: 'pr@smarthome.com', status: 'published' },
      { headline: 'ConsultPro Opens European HQ', subheadline: 'London office launch', dateline: 'LONDON, Jun 15, 2024', body: 'ConsultPro announced European headquarters.', boilerplate: 'ConsultPro provides strategic consulting.', contact_info: 'global@consultpro.com', status: 'published' }
    ];
    for (const pr of pressReleases) {
      await client.query(
        'INSERT INTO press_releases (user_id, headline, subheadline, dateline, body, boilerplate, contact_info, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, pr.headline, pr.subheadline, pr.dateline, pr.body, pr.boilerplate, pr.contact_info, pr.status]
      );
    }
    console.log('Seeded 15 press releases');

    // Seed Video Scripts (15 items)
    const videoScripts = [
      { title: 'Product Launch Announcement', video_type: 'YouTube', duration_seconds: 120, script_content: '[0:00-0:05] Logo animation\n[0:05-0:15] Host intro\n[0:15-2:00] Product showcase', visual_notes: 'Product shots, feature animations', voiceover_text: 'Energetic, professional', status: 'published' },
      { title: '15-Second Ad Spot', video_type: 'TikTok', duration_seconds: 15, script_content: '[0:00-0:03] Hook\n[0:03-0:10] Quick demo\n[0:10-0:15] CTA', visual_notes: 'Fast cuts, trending music', voiceover_text: 'Fast-paced, casual', status: 'published' },
      { title: 'Customer Testimonial', video_type: 'Promotional', duration_seconds: 90, script_content: '[0:00-0:10] Introduction\n[0:10-0:40] Story\n[0:40-1:30] Results', visual_notes: 'Interview style, b-roll', voiceover_text: 'Natural, authentic', status: 'published' },
      { title: 'How-To Tutorial', video_type: 'YouTube', duration_seconds: 300, script_content: '[0:00-0:30] Intro\n[0:30-4:30] Step-by-step\n[4:30-5:00] Recap', visual_notes: 'Screen recording, close-ups', voiceover_text: 'Instructional, clear', status: 'published' },
      { title: 'Instagram Reels Teaser', video_type: 'Instagram Reels', duration_seconds: 30, script_content: '[0:00-0:05] Attention grab\n[0:05-0:25] Highlights\n[0:25-0:30] CTA', visual_notes: 'Vertical, trendy transitions', voiceover_text: 'Upbeat, engaging', status: 'published' },
      { title: 'Company Culture Video', video_type: 'Promotional', duration_seconds: 180, script_content: '[0:00-0:20] Team montage\n[0:20-2:30] Employee interviews\n[2:30-3:00] CTA', visual_notes: 'Candid shots, office footage', voiceover_text: 'Warm, inclusive', status: 'draft' },
      { title: 'LinkedIn Ad', video_type: 'LinkedIn Ad', duration_seconds: 30, script_content: '[0:00-0:05] Hook\n[0:05-0:25] Value prop\n[0:25-0:30] CTA', visual_notes: 'Clean graphics, professional', voiceover_text: 'Professional, confident', status: 'published' },
      { title: 'Explainer Video', video_type: 'Promotional', duration_seconds: 120, script_content: '[0:00-0:15] Problem\n[0:15-1:30] Solution\n[1:30-2:00] CTA', visual_notes: 'Animated graphics', voiceover_text: 'Friendly, informative', status: 'published' },
      { title: 'Facebook Ad - Testimonial', video_type: 'Facebook Ad', duration_seconds: 45, script_content: '[0:00-0:10] Pain point\n[0:10-0:35] Discovery\n[0:35-0:45] CTA', visual_notes: 'UGC and polished mix', voiceover_text: 'Authentic, persuasive', status: 'published' },
      { title: 'Event Recap', video_type: 'YouTube', duration_seconds: 180, script_content: '[0:00-0:30] Highlights\n[0:30-2:30] Key moments\n[2:30-3:00] Next event', visual_notes: 'Dynamic event footage', voiceover_text: 'Exciting, celebratory', status: 'published' },
      { title: 'Product Comparison', video_type: 'YouTube', duration_seconds: 240, script_content: '[0:00-0:30] Intro\n[0:30-3:30] Comparisons\n[3:30-4:00] Verdict', visual_notes: 'Split screen, ratings', voiceover_text: 'Objective, thorough', status: 'draft' },
      { title: 'Behind the Scenes', video_type: 'Instagram Reels', duration_seconds: 60, script_content: '[0:00-0:15] How we make\n[0:15-0:50] Process\n[0:50-1:00] Reveal', visual_notes: 'Raw, authentic footage', voiceover_text: 'Casual, fun', status: 'published' },
      { title: 'FAQ Video', video_type: 'YouTube', duration_seconds: 150, script_content: '[0:00-0:15] Intro\n[0:15-2:15] Q&As\n[2:15-2:30] More questions?', visual_notes: 'Host on camera, text overlays', voiceover_text: 'Helpful, personable', status: 'published' },
      { title: 'Holiday Sale Promo', video_type: 'TikTok', duration_seconds: 20, script_content: '[0:00-0:05] Biggest sale!\n[0:05-0:15] Deals\n[0:15-0:20] Link in bio', visual_notes: 'Festive graphics, urgency', voiceover_text: 'Excited, urgent', status: 'published' },
      { title: 'Founder Story', video_type: 'Promotional', duration_seconds: 240, script_content: '[0:00-0:30] Intro\n[0:30-3:30] Journey\n[3:30-4:00] Vision', visual_notes: 'Interview, archival footage', voiceover_text: 'Personal, inspiring', status: 'published' }
    ];
    for (const script of videoScripts) {
      await client.query(
        'INSERT INTO video_scripts (user_id, title, video_type, duration_seconds, script_content, visual_notes, voiceover_text, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, script.title, script.video_type, script.duration_seconds, script.script_content, script.visual_notes, script.voiceover_text, script.status]
      );
    }
    console.log('Seeded 15 video scripts');

    // Seed SEO Optimizations (15 items)
    const seoOptimizations = [
      { original_content: 'We sell good products.', optimized_content: 'Discover premium products designed to transform your daily routine.', content_type: 'Homepage', keywords_added: 'premium products, transform', readability_score: 85, seo_score_before: 35, seo_score_after: 82, suggestions: '- Add specific keywords\n- Include testimonials', status: 'completed' },
      { original_content: 'Our software is fast.', optimized_content: 'Experience lightning-fast performance with our award-winning software.', content_type: 'Product Page', keywords_added: 'lightning-fast, award-winning', readability_score: 78, seo_score_before: 28, seo_score_after: 79, suggestions: '- Add benchmarks\n- Include comparisons', status: 'completed' },
      { original_content: 'Contact us for info.', optimized_content: 'Ready to transform your business? Contact our expert team for a free consultation.', content_type: 'Contact Page', keywords_added: 'free consultation, expert team', readability_score: 88, seo_score_before: 42, seo_score_after: 75, suggestions: '- Add FAQ\n- Include contact form', status: 'completed' },
      { original_content: 'Buy our stuff today.', optimized_content: 'Shop our curated collection with free shipping on orders over $50.', content_type: 'E-commerce', keywords_added: 'free shipping, curated collection', readability_score: 82, seo_score_before: 22, seo_score_after: 85, suggestions: '- Add reviews\n- Optimize images', status: 'completed' },
      { original_content: 'We have experience.', optimized_content: 'With 15 years of experience and 10,000+ satisfied customers.', content_type: 'About Page', keywords_added: '15 years, 10,000+ customers', readability_score: 80, seo_score_before: 38, seo_score_after: 78, suggestions: '- Add team photos\n- Include timeline', status: 'completed' },
      { original_content: 'Sign up for newsletter.', optimized_content: 'Join 50,000+ subscribers for exclusive weekly insights.', content_type: 'Newsletter CTA', keywords_added: '50,000+ subscribers, exclusive', readability_score: 86, seo_score_before: 30, seo_score_after: 72, suggestions: '- Add social proof\n- Show sample', status: 'completed' },
      { original_content: 'Our team helps customers.', optimized_content: 'Our dedicated support team provides 24/7 assistance with 98% satisfaction.', content_type: 'Support Page', keywords_added: '24/7 support, 98% satisfaction', readability_score: 84, seo_score_before: 25, seo_score_after: 81, suggestions: '- Add support categories\n- Include SLAs', status: 'completed' },
      { original_content: 'We offer different plans.', optimized_content: 'Choose the perfect plan with flexible pricing and no hidden fees.', content_type: 'Pricing Page', keywords_added: 'flexible pricing, no hidden fees', readability_score: 83, seo_score_before: 32, seo_score_after: 80, suggestions: '- Add comparison table\n- Include FAQ', status: 'completed' },
      { original_content: 'Read our blog for tips.', optimized_content: 'Explore our marketing resource center featuring expert guides.', content_type: 'Blog Landing', keywords_added: 'marketing resources, expert guides', readability_score: 79, seo_score_before: 40, seo_score_after: 84, suggestions: '- Add category filters\n- Include popular posts', status: 'completed' },
      { original_content: 'Download our app.', optimized_content: 'Get our top-rated mobile app with 4.8-star ratings from 100,000+ users.', content_type: 'App Landing', keywords_added: '4.8-star, 100,000+ users', readability_score: 81, seo_score_before: 35, seo_score_after: 83, suggestions: '- Add screenshots\n- Include features', status: 'completed' },
      { original_content: 'Check out new products.', optimized_content: 'Discover latest arrivals with cutting-edge technology and exclusive pricing.', content_type: 'New Arrivals', keywords_added: 'latest arrivals, exclusive pricing', readability_score: 77, seo_score_before: 33, seo_score_after: 79, suggestions: '- Add release dates\n- Include previews', status: 'completed' },
      { original_content: 'See what customers say.', optimized_content: 'Join thousands of satisfied customers with verified reviews and case studies.', content_type: 'Testimonials', keywords_added: 'verified reviews, case studies', readability_score: 85, seo_score_before: 37, seo_score_after: 82, suggestions: '- Add video testimonials\n- Include logos', status: 'completed' },
      { original_content: 'We integrate with tools.', optimized_content: 'Seamlessly connect with 200+ popular tools including Salesforce and HubSpot.', content_type: 'Integrations', keywords_added: '200+ integrations, Salesforce', readability_score: 76, seo_score_before: 41, seo_score_after: 86, suggestions: '- Add logos\n- Include setup guides', status: 'completed' },
      { original_content: 'Learn about security.', optimized_content: 'Your data is protected with SOC 2 certification, GDPR compliance, and 256-bit encryption.', content_type: 'Security Page', keywords_added: 'SOC 2, GDPR, 256-bit encryption', readability_score: 74, seo_score_before: 45, seo_score_after: 88, suggestions: '- Add badges\n- Include docs', status: 'completed' },
      { original_content: 'Find a job with us.', optimized_content: 'Build your career at a Best Place to Work with remote-friendly positions and competitive salaries.', content_type: 'Careers Page', keywords_added: 'Best Place to Work, remote-friendly', readability_score: 82, seo_score_before: 39, seo_score_after: 80, suggestions: '- Add job filters\n- Include stories', status: 'completed' }
    ];
    for (const seo of seoOptimizations) {
      await client.query(
        'INSERT INTO seo_optimizations (user_id, original_content, optimized_content, content_type, keywords_added, readability_score, seo_score_before, seo_score_after, suggestions, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [userId, seo.original_content, seo.optimized_content, seo.content_type, seo.keywords_added, seo.readability_score, seo.seo_score_before, seo.seo_score_after, seo.suggestions, seo.status]
      );
    }
    console.log('Seeded 15 SEO optimizations');

    // Seed Tone Adjustments (15 items)
    const toneAdjustments = [
      { original_text: 'Your payment is overdue. Pay now.', adjusted_text: 'We noticed your payment is pending. We are here to help with flexible options.', original_tone: 'Demanding', target_tone: 'Empathetic', context: 'Payment reminder', confidence_score: 92, status: 'completed' },
      { original_text: 'This product is okay.', adjusted_text: 'This exceptional product exceeds expectations! Experience unparalleled quality!', original_tone: 'Neutral', target_tone: 'Enthusiastic', context: 'Product description', confidence_score: 88, status: 'completed' },
      { original_text: 'We are really super excited!!!', adjusted_text: 'We are pleased to announce this significant development.', original_tone: 'Overly Casual', target_tone: 'Professional', context: 'Press release', confidence_score: 95, status: 'completed' },
      { original_text: 'The software has features.', adjusted_text: 'OMG, you will NOT believe what this software can do! THE most amazing features!', original_tone: 'Neutral', target_tone: 'Playful', context: 'Social media', confidence_score: 85, status: 'completed' },
      { original_text: 'Buy our product.', adjusted_text: 'Discover how thousands have transformed their lives with our solution.', original_tone: 'Direct', target_tone: 'Persuasive', context: 'Marketing copy', confidence_score: 90, status: 'completed' },
      { original_text: 'There was an error.', adjusted_text: 'We sincerely apologize for the inconvenience. Our team is working to resolve this.', original_tone: 'Neutral', target_tone: 'Apologetic', context: 'Customer service', confidence_score: 93, status: 'completed' },
      { original_text: 'Results were good.', adjusted_text: 'We are thrilled to report outstanding performance! Our strongest quarter yet!', original_tone: 'Understated', target_tone: 'Confident', context: 'Investor communication', confidence_score: 87, status: 'completed' },
      { original_text: 'You should update.', adjusted_text: 'Critical security update available. We strongly recommend updating immediately.', original_tone: 'Hesitant', target_tone: 'Urgent', context: 'Security notification', confidence_score: 94, status: 'completed' },
      { original_text: 'Fill out the form.', adjusted_text: 'We would love to hear from you! Drop us a message and our awesome team will respond!', original_tone: 'Formal', target_tone: 'Friendly', context: 'Contact page', confidence_score: 89, status: 'completed' },
      { original_text: 'Learn about algorithms.', adjusted_text: 'Curious about machine learning? Let me break it down in simple terms...', original_tone: 'Technical', target_tone: 'Educational', context: 'Blog post', confidence_score: 91, status: 'completed' },
      { original_text: 'This deal ends soon.', adjusted_text: 'Only 3 hours left! Once it is gone, it is gone forever. Do not miss out!', original_tone: 'Neutral', target_tone: 'FOMO-inducing', context: 'Sale notification', confidence_score: 86, status: 'completed' },
      { original_text: 'We made a mistake.', adjusted_text: 'Oops! We goofed up. Here is the corrected info - thanks for bearing with us!', original_tone: 'Formal', target_tone: 'Casual', context: 'Correction email', confidence_score: 88, status: 'completed' },
      { original_text: 'Check out new feature.', adjusted_text: 'Introducing a groundbreaking innovation that will revolutionize how you work.', original_tone: 'Casual', target_tone: 'Visionary', context: 'Feature announcement', confidence_score: 84, status: 'completed' },
      { original_text: 'Subscription ending.', adjusted_text: 'Just a friendly heads up! Your subscription is wrapping up. We loved having you!', original_tone: 'Transactional', target_tone: 'Warm', context: 'Renewal reminder', confidence_score: 90, status: 'completed' },
      { original_text: 'Here are the notes.', adjusted_text: 'Great session today! Here are the key takeaways. Excited about our direction!', original_tone: 'Neutral', target_tone: 'Positive', context: 'Internal communication', confidence_score: 87, status: 'completed' }
    ];
    for (const tone of toneAdjustments) {
      await client.query(
        'INSERT INTO tone_adjustments (user_id, original_text, adjusted_text, original_tone, target_tone, context, confidence_score, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [userId, tone.original_text, tone.adjusted_text, tone.original_tone, tone.target_tone, tone.context, tone.confidence_score, tone.status]
      );
    }
    console.log('Seeded 15 tone adjustments');

    // Seed A/B Variations (15 items)
    const abVariations = [
      { original_content: 'Sign up for free', content_type: 'CTA Button', variation_a: 'Start Free Trial', variation_b: 'Get Started Free', variation_c: 'Try It Free - No Card', hypothesis: 'A: Action-oriented. B: Simplicity. C: Objection handling.', test_goal: 'Increase signups', recommended_variant: 'C', status: 'active' },
      { original_content: 'Buy Now', content_type: 'E-commerce Button', variation_a: 'Add to Cart', variation_b: 'Get Yours Today', variation_c: 'Claim Discount', hypothesis: 'A: Lower commitment. B: Urgency. C: Value emphasis.', test_goal: 'Increase add-to-cart', recommended_variant: 'B', status: 'active' },
      { original_content: 'Subscribe to newsletter', content_type: 'Email Signup', variation_a: 'Join 50,000+ subscribers', variation_b: 'Get weekly tips', variation_c: 'Never miss an update', hypothesis: 'A: Social proof. B: Value prop. C: FOMO.', test_goal: 'Increase signups', recommended_variant: 'A', status: 'active' },
      { original_content: 'Contact Sales', content_type: 'Lead Gen Button', variation_a: 'Talk to an Expert', variation_b: 'Get Free Consultation', variation_c: 'See Pricing & Demo', hypothesis: 'A: Expertise. B: Free value. C: Transparency.', test_goal: 'Increase demos', recommended_variant: 'B', status: 'active' },
      { original_content: 'Learn More', content_type: 'Information CTA', variation_a: 'See How It Works', variation_b: 'Discover Benefits', variation_c: 'Watch 2-Min Demo', hypothesis: 'A: Process. B: Benefits. C: Time commitment.', test_goal: 'Increase engagement', recommended_variant: 'C', status: 'active' },
      { original_content: 'Limited Time Offer', content_type: 'Urgency Banner', variation_a: 'Sale Ends Tonight', variation_b: 'Only 5 Left', variation_c: '72-Hour Flash Sale', hypothesis: 'A: Time urgency. B: Scarcity. C: Combined.', test_goal: 'Increase conversions', recommended_variant: 'A', status: 'active' },
      { original_content: 'Download App', content_type: 'App Install CTA', variation_a: 'Get Free App', variation_b: 'Download - 4.9 Stars', variation_c: 'Join 1M+ Users', hypothesis: 'A: Free. B: Quality. C: Social proof.', test_goal: 'Increase downloads', recommended_variant: 'B', status: 'active' },
      { original_content: 'Create Account', content_type: 'Registration CTA', variation_a: 'Join Free in 30 Seconds', variation_b: 'Start Your Journey', variation_c: 'Unlock All Features', hypothesis: 'A: Speed. B: Emotional. C: Value.', test_goal: 'Increase registrations', recommended_variant: 'A', status: 'active' },
      { original_content: 'Read the Blog', content_type: 'Content CTA', variation_a: 'Get Expert Insights', variation_b: 'Read Success Stories', variation_c: 'Learn Industry Secrets', hypothesis: 'A: Authority. B: Proof. C: Curiosity.', test_goal: 'Increase blog traffic', recommended_variant: 'C', status: 'active' },
      { original_content: 'Request Demo', content_type: 'Demo CTA', variation_a: 'See It in Action', variation_b: 'Book Personal Demo', variation_c: 'Get Custom Walkthrough', hypothesis: 'A: Action. B: Personal. C: Custom.', test_goal: 'Increase demos', recommended_variant: 'B', status: 'active' },
      { original_content: 'Upgrade Plan', content_type: 'Upsell CTA', variation_a: 'Unlock Premium', variation_b: 'Go Pro - Save 20%', variation_c: 'Upgrade & Get 3 Months Free', hypothesis: 'A: Features. B: Discount. C: Extended trial.', test_goal: 'Increase upgrades', recommended_variant: 'C', status: 'active' },
      { original_content: 'Share with Friends', content_type: 'Referral CTA', variation_a: 'Give $20, Get $20', variation_b: 'Invite & Earn Rewards', variation_c: 'Share - Both Get 50% Off', hypothesis: 'A: Clear incentive. B: Reward. C: Mutual.', test_goal: 'Increase referrals', recommended_variant: 'A', status: 'active' },
      { original_content: 'Leave a Review', content_type: 'Review Request', variation_a: 'Share Your Experience', variation_b: 'Help Others by Reviewing', variation_c: 'Rate Us & Get 10% Off', hypothesis: 'A: Easy. B: Altruistic. C: Incentivized.', test_goal: 'Increase reviews', recommended_variant: 'C', status: 'active' },
      { original_content: 'View Pricing', content_type: 'Pricing CTA', variation_a: 'See Plans & Pricing', variation_b: 'Find Your Perfect Plan', variation_c: 'Compare Plans - Start Free', hypothesis: 'A: Direct. B: Personalized. C: Low commitment.', test_goal: 'Increase pricing views', recommended_variant: 'C', status: 'active' },
      { original_content: 'Apply Now', content_type: 'Application CTA', variation_a: 'Submit Application', variation_b: 'Take the First Step', variation_c: 'Apply in Under 5 Minutes', hypothesis: 'A: Formal. B: Journey. C: Time clarity.', test_goal: 'Increase applications', recommended_variant: 'C', status: 'active' }
    ];
    for (const ab of abVariations) {
      await client.query(
        'INSERT INTO ab_variations (user_id, original_content, content_type, variation_a, variation_b, variation_c, hypothesis, test_goal, recommended_variant, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [userId, ab.original_content, ab.content_type, ab.variation_a, ab.variation_b, ab.variation_c, ab.hypothesis, ab.test_goal, ab.recommended_variant, ab.status]
      );
    }
    console.log('Seeded 15 A/B variations');

    // Seed Headline Scores (15 items)
    const headlineScores = [
      { headline: '10 Ways to Boost Your Productivity Today', overall_score: 82, emotional_score: 75, power_words_score: 80, length_score: 90, clarity_score: 88, seo_score: 78, suggestions: '- Add number benefit\n- Include urgency', improved_headlines: '10 Proven Ways to 10x Your Productivity\nBoost Productivity by 200% with These Tricks', status: 'completed' },
      { headline: 'New Product Available', overall_score: 35, emotional_score: 20, power_words_score: 15, length_score: 60, clarity_score: 70, seo_score: 30, suggestions: '- Too generic\n- Add benefit\n- Add emotion', improved_headlines: 'Introducing the Revolutionary Product That Changes Everything\nThe Product You Have Been Waiting For Is Here', status: 'completed' },
      { headline: 'Why Your Marketing Strategy Is Failing', overall_score: 78, emotional_score: 85, power_words_score: 70, length_score: 85, clarity_score: 80, seo_score: 75, suggestions: '- Strong emotional hook\n- Add solution hint', improved_headlines: '7 Reasons Why Your Marketing Strategy Is Failing\nThe Hidden Mistakes Killing Your Marketing', status: 'completed' },
      { headline: 'Buy Our Software', overall_score: 22, emotional_score: 10, power_words_score: 20, length_score: 40, clarity_score: 60, seo_score: 25, suggestions: '- Needs complete rewrite\n- Add value proposition', improved_headlines: 'Transform Your Workflow with Award-Winning Software\nThe Software 10,000+ Teams Trust', status: 'completed' },
      { headline: 'The Ultimate Guide to Email Marketing', overall_score: 88, emotional_score: 80, power_words_score: 90, length_score: 85, clarity_score: 92, seo_score: 95, suggestions: '- Strong overall\n- Consider adding benefit', improved_headlines: 'The Ultimate Email Marketing Guide: Strategies That Convert\nMaster Email Marketing: The Definitive Guide', status: 'completed' },
      { headline: 'How I Made $100K in One Month', overall_score: 75, emotional_score: 90, power_words_score: 85, length_score: 80, clarity_score: 75, seo_score: 65, suggestions: '- High curiosity\n- Add credibility', improved_headlines: 'How I Made $100K in One Month (Blueprint)\nFrom $0 to $100K: My 30-Day Journey', status: 'completed' },
      { headline: 'Tips for Better Sleep', overall_score: 55, emotional_score: 50, power_words_score: 40, length_score: 70, clarity_score: 75, seo_score: 60, suggestions: '- Too vague\n- Add number\n- Add benefit', improved_headlines: '7 Science-Backed Tips for Best Sleep Ever\nSleep Like a Baby: Expert Tips', status: 'completed' },
      { headline: 'Breaking: Major Industry Announcement', overall_score: 68, emotional_score: 75, power_words_score: 80, length_score: 75, clarity_score: 55, seo_score: 50, suggestions: '- Good urgency, lacks specifics\n- Add context', improved_headlines: 'Breaking: Company Announces Game-Changing Feature\nMajor Announcement: Industry Will Never Be Same', status: 'completed' },
      { headline: 'Customer Success Story', overall_score: 42, emotional_score: 45, power_words_score: 35, length_score: 65, clarity_score: 55, seo_score: 40, suggestions: '- Needs specific details\n- Add result', improved_headlines: 'How Customer Increased Revenue by 300%\nFrom Struggling to Thriving: Success Story', status: 'completed' },
      { headline: 'Free Download Inside', overall_score: 58, emotional_score: 65, power_words_score: 70, length_score: 50, clarity_score: 45, seo_score: 55, suggestions: '- What is the download?\n- Add value', improved_headlines: 'Free Download: Complete Toolkit (Worth $99)\nGrab Your Free Resource - Limited Time', status: 'completed' },
      { headline: 'The Secret to Successful Investing', overall_score: 72, emotional_score: 80, power_words_score: 75, length_score: 80, clarity_score: 70, seo_score: 68, suggestions: '- Good curiosity\n- Add specificity', improved_headlines: 'The Secret Wall Street Does Not Want You to Know\nUnlock the Secret: How Investors Build Wealth', status: 'completed' },
      { headline: 'Important Update', overall_score: 28, emotional_score: 30, power_words_score: 25, length_score: 40, clarity_score: 35, seo_score: 20, suggestions: '- Extremely vague\n- Add context and urgency', improved_headlines: 'Important Update: Changes Starting Date\nAction Required: Critical Account Update', status: 'completed' },
      { headline: '5 Mistakes Every Entrepreneur Makes', overall_score: 80, emotional_score: 82, power_words_score: 75, length_score: 88, clarity_score: 85, seo_score: 78, suggestions: '- Strong format\n- Add solution hint', improved_headlines: '5 Costly Mistakes Every Entrepreneur Makes\nAvoid These 5 Startup-Killing Mistakes', status: 'completed' },
      { headline: 'Join Our Community', overall_score: 45, emotional_score: 50, power_words_score: 40, length_score: 55, clarity_score: 60, seo_score: 35, suggestions: '- What kind of community?\n- Add benefit', improved_headlines: 'Join 50,000+ Professionals in Our Community\nYour Tribe Awaits: Join the Community', status: 'completed' },
      { headline: 'Revolutionary AI Technology Changes Everything', overall_score: 70, emotional_score: 78, power_words_score: 85, length_score: 75, clarity_score: 65, seo_score: 72, suggestions: '- Good power words but vague\n- Add specifics', improved_headlines: 'Revolutionary AI Cuts Work Time by 80%\nThis AI Breakthrough Changes How You Work', status: 'completed' }
    ];
    for (const hs of headlineScores) {
      await client.query(
        'INSERT INTO headline_scores (user_id, headline, overall_score, emotional_score, power_words_score, length_score, clarity_score, seo_score, suggestions, improved_headlines, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [userId, hs.headline, hs.overall_score, hs.emotional_score, hs.power_words_score, hs.length_score, hs.clarity_score, hs.seo_score, hs.suggestions, hs.improved_headlines, hs.status]
      );
    }
    console.log('Seeded 15 headline scores');

    // Seed Localizations (15 items)
    const localizations = [
      { original_content: 'Get started with our free trial today!', source_language: 'English', target_language: 'Spanish', localized_content: 'Comienza hoy con nuestra prueba gratuita!', content_type: 'CTA', cultural_notes: 'Informal "Comienza" works for digital marketing', region: 'Latin America', quality_score: 95, status: 'completed' },
      { original_content: 'Black Friday Sale - Up to 50% Off!', source_language: 'English', target_language: 'French', localized_content: 'Soldes Black Friday - Jusqu a 50% de reduction!', content_type: 'Promotional', cultural_notes: 'Black Friday is recognized in France', region: 'France', quality_score: 92, status: 'completed' },
      { original_content: 'Join millions of satisfied customers', source_language: 'English', target_language: 'German', localized_content: 'Schliessen Sie sich Millionen zufriedener Kunden an', content_type: 'Social Proof', cultural_notes: 'Formal "Sie" for business context', region: 'Germany', quality_score: 94, status: 'completed' },
      { original_content: 'Limited time offer - Act now!', source_language: 'English', target_language: 'Japanese', localized_content: '期間限定オファー - 今すぐお申し込みください!', content_type: 'Urgency', cultural_notes: 'Polite form used; softer urgency for Japan', region: 'Japan', quality_score: 91, status: 'completed' },
      { original_content: 'The smart choice for your business', source_language: 'English', target_language: 'Portuguese', localized_content: 'A escolha inteligente para o seu negocio', content_type: 'Tagline', cultural_notes: 'Brazilian Portuguese used', region: 'Brazil', quality_score: 93, status: 'completed' },
      { original_content: 'Your success is our priority', source_language: 'English', target_language: 'Chinese', localized_content: '您的成功是我们的首要任务', content_type: 'Mission Statement', cultural_notes: 'Formal Chinese; mutual success resonates', region: 'China', quality_score: 90, status: 'completed' },
      { original_content: 'Easy to use, powerful results', source_language: 'English', target_language: 'Italian', localized_content: 'Facile da usare, risultati potenti', content_type: 'Product Description', cultural_notes: 'Italians appreciate elegant language', region: 'Italy', quality_score: 94, status: 'completed' },
      { original_content: 'Subscribe and save 20%', source_language: 'English', target_language: 'Dutch', localized_content: 'Abonneer en bespaar 20%', content_type: 'Subscription CTA', cultural_notes: 'Dutch value-conscious; direct translation works', region: 'Netherlands', quality_score: 96, status: 'completed' },
      { original_content: 'Trusted by industry leaders', source_language: 'English', target_language: 'Korean', localized_content: '전 세계 업계 리더들이 신뢰하는', content_type: 'Trust Badge', cultural_notes: 'Hierarchy valued in Korean business', region: 'South Korea', quality_score: 92, status: 'completed' },
      { original_content: 'Start your journey today', source_language: 'English', target_language: 'Arabic', localized_content: 'ابدأ رحلتك اليوم', content_type: 'CTA', cultural_notes: 'RTL script; journey metaphor translates well', region: 'Middle East', quality_score: 89, status: 'completed' },
      { original_content: 'New features, same great price', source_language: 'English', target_language: 'Swedish', localized_content: 'Nya funktioner, samma fantastiska pris', content_type: 'Product Update', cultural_notes: 'Swedes prefer understated marketing', region: 'Sweden', quality_score: 95, status: 'completed' },
      { original_content: 'Customer support available 24/7', source_language: 'English', target_language: 'Polish', localized_content: 'Obsluga klienta dostepna 24/7', content_type: 'Support Info', cultural_notes: '24/7 format universally understood', region: 'Poland', quality_score: 97, status: 'completed' },
      { original_content: 'Transform your workflow', source_language: 'English', target_language: 'Hindi', localized_content: 'अपने वर्कफ़्लो को बदलें', content_type: 'Value Proposition', cultural_notes: 'Hindi-English mix common in India tech', region: 'India', quality_score: 88, status: 'completed' },
      { original_content: 'Premium quality guaranteed', source_language: 'English', target_language: 'Russian', localized_content: 'Гарантированное премиум-качество', content_type: 'Quality Assurance', cultural_notes: 'Russians value guarantees; премиум is common', region: 'Russia', quality_score: 91, status: 'completed' },
      { original_content: 'Join the revolution', source_language: 'English', target_language: 'Turkish', localized_content: 'Devrime katil', content_type: 'Brand Message', cultural_notes: 'Informal for modern feel; positive connotation', region: 'Turkey', quality_score: 90, status: 'completed' }
    ];
    for (const loc of localizations) {
      await client.query(
        'INSERT INTO localizations (user_id, original_content, source_language, target_language, localized_content, content_type, cultural_notes, region, quality_score, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [userId, loc.original_content, loc.source_language, loc.target_language, loc.localized_content, loc.content_type, loc.cultural_notes, loc.region, loc.quality_score, loc.status]
      );
    }
    console.log('Seeded 15 localizations');

    console.log('\n========================================');
    console.log('Database seeding completed successfully!');
    console.log('========================================');
    console.log('Demo credentials were injected and are not displayed.');
    console.log('========================================\n');

  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
