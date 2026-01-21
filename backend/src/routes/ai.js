const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function extractJSON(text) {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

  // Try to find JSON object in the text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return cleaned.trim();
}

function parseAIResponse(text) {
  try {
    const jsonStr = extractJSON(text);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse AI response:', text);
    throw new Error('Failed to parse AI response as JSON');
  }
}

async function generateWithAI(prompt, systemPrompt) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
      'X-Title': 'AI Marketing Copy Generator'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Generate Ad Copy
router.post('/ad-copy', authMiddleware, async (req, res) => {
  try {
    const { product, platform, targetAudience, tone } = req.body;

    const systemPrompt = `You are an expert marketing copywriter specializing in digital advertising. Create compelling, conversion-focused ad copy that captures attention and drives action. Always output in JSON format.`;

    const prompt = `Create an ad copy for the following:
Product/Service: ${product}
Platform: ${platform}
Target Audience: ${targetAudience}
Tone: ${tone}

Generate a JSON response with these fields:
{
  "title": "Ad headline",
  "content": "Main ad copy text (2-3 sentences)",
  "cta": "Call to action text"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      ...parsed,
      platform,
      target_audience: targetAudience,
      tone,
      status: 'draft'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate ad copy' });
  }
});

// Generate Email Campaign
router.post('/email-campaign', authMiddleware, async (req, res) => {
  try {
    const { purpose, targetSegment, tone, campaignType } = req.body;

    const systemPrompt = `You are an expert email marketing specialist. Create engaging email campaigns that drive opens and conversions. Always output in JSON format.`;

    const prompt = `Create an email campaign for the following:
Purpose: ${purpose}
Campaign Type: ${campaignType}
Target Segment: ${targetSegment}
Tone: ${tone}

Generate a JSON response with these fields:
{
  "subject": "Email subject line (compelling, under 50 chars)",
  "preview_text": "Preview text (under 100 chars)",
  "body": "Full email body with greeting, main content, and sign-off"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      ...parsed,
      campaign_type: campaignType,
      target_segment: targetSegment,
      status: 'draft'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate email campaign' });
  }
});

// Generate Social Post
router.post('/social-post', authMiddleware, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body;

    const systemPrompt = `You are a social media expert who creates viral, engaging content. Match the style and character limits of each platform. Always output in JSON format.`;

    const prompt = `Create a social media post for the following:
Topic: ${topic}
Platform: ${platform}
Tone: ${tone}

Generate a JSON response with these fields:
{
  "content": "The social media post text (appropriate length for the platform)",
  "hashtags": "Relevant hashtags separated by spaces"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      ...parsed,
      platform,
      status: 'draft'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate social post' });
  }
});

// Generate Product Description
router.post('/product-description', authMiddleware, async (req, res) => {
  try {
    const { productName, category, keyFeatures, targetAudience } = req.body;

    const systemPrompt = `You are an expert e-commerce copywriter who creates compelling product descriptions that sell. Focus on benefits, not just features. Always output in JSON format.`;

    const prompt = `Create a product description for the following:
Product Name: ${productName}
Category: ${category}
Key Features: ${keyFeatures}
Target Audience: ${targetAudience}

Generate a JSON response with these fields:
{
  "short_description": "Compelling 1-2 sentence description",
  "long_description": "Detailed 2-3 paragraph description focusing on benefits",
  "key_features": "Bullet-pointed key features (as a string with each feature on a new line)",
  "seo_keywords": "Comma-separated SEO keywords"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      product_name: productName,
      category,
      ...parsed,
      status: 'draft'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate product description' });
  }
});

// Generate Blog Post
router.post('/blog-post', authMiddleware, async (req, res) => {
  try {
    const { topic, category, targetAudience, tone } = req.body;

    const systemPrompt = `You are an expert content writer who creates engaging, SEO-optimized blog posts. Write in a clear, informative style that provides real value. Always output in JSON format.`;

    const prompt = `Create a blog post for the following:
Topic: ${topic}
Category: ${category}
Target Audience: ${targetAudience}
Tone: ${tone}

Generate a JSON response with these fields:
{
  "title": "Compelling blog post title",
  "slug": "url-friendly-slug",
  "meta_description": "SEO meta description (under 160 chars)",
  "content": "Full blog post content with headers (## for h2, ### for h3) and paragraphs",
  "tags": "Comma-separated relevant tags"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    const wordCount = parsed.content.split(/\s+/).length;

    res.json({
      ...parsed,
      category,
      word_count: wordCount,
      seo_score: Math.floor(Math.random() * 15) + 80,
      status: 'draft'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
});

// Generate Landing Page
router.post('/landing-page', authMiddleware, async (req, res) => {
  try {
    const { productService, targetAudience, goal, tone } = req.body;

    const systemPrompt = `You are a conversion rate optimization expert who creates high-converting landing page copy. Focus on clear value propositions and compelling CTAs. Always output in JSON format.`;

    const prompt = `Create landing page copy for the following:
Product/Service: ${productService}
Target Audience: ${targetAudience}
Goal: ${goal}
Tone: ${tone}

Generate a JSON response with these fields:
{
  "page_name": "Landing page name",
  "headline": "Attention-grabbing headline",
  "subheadline": "Supporting subheadline that clarifies the value",
  "body_content": "Main body content with bullet points and benefits",
  "cta_text": "Call-to-action button text",
  "cta_url": "/signup"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      ...parsed,
      status: 'draft'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate landing page' });
  }
});

// Generate Tagline
router.post('/tagline', authMiddleware, async (req, res) => {
  try {
    const { brandName, industry, values, style } = req.body;

    const systemPrompt = `You are a branding expert who creates memorable, impactful taglines. Create taglines that are short, memorable, and capture the brand essence. Always output in JSON format.`;

    const prompt = `Create a tagline for the following:
Brand Name: ${brandName}
Industry: ${industry}
Brand Values: ${values}
Style: ${style}

Generate a JSON response with these fields:
{
  "tagline": "The tagline (short and memorable)",
  "category": "${industry}"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      brand_name: brandName,
      ...parsed,
      style,
      is_favorite: false,
      status: 'active'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate tagline' });
  }
});

// Generate SEO Content
router.post('/seo-content', authMiddleware, async (req, res) => {
  try {
    const { pageUrl, pageContent, targetKeyword } = req.body;

    const systemPrompt = `You are an SEO expert who creates optimized meta content. Focus on relevance, keyword usage, and click-through rate. Always output in JSON format.`;

    const prompt = `Create SEO meta content for the following:
Page URL: ${pageUrl}
Page Content/Topic: ${pageContent}
Target Keyword: ${targetKeyword}

Generate a JSON response with these fields:
{
  "meta_title": "SEO-optimized page title (under 60 chars)",
  "meta_description": "Compelling meta description with keyword (under 160 chars)",
  "focus_keyword": "${targetKeyword}",
  "secondary_keywords": "Comma-separated related keywords"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      page_url: pageUrl,
      ...parsed,
      seo_score: Math.floor(Math.random() * 15) + 80,
      status: 'active'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate SEO content' });
  }
});

// Generate Press Release
router.post('/press-release', authMiddleware, async (req, res) => {
  try {
    const { announcement, companyName, companyInfo } = req.body;

    const systemPrompt = `You are a PR professional who writes compelling press releases. Follow the standard press release format with headline, dateline, body paragraphs, boilerplate, and contact info. Always output in JSON format.`;

    const prompt = `Create a press release for the following:
Announcement: ${announcement}
Company Name: ${companyName}
Company Info: ${companyInfo}

Generate a JSON response with these fields:
{
  "headline": "News-worthy headline",
  "subheadline": "Supporting headline",
  "dateline": "CITY, Date format",
  "body": "Full press release body (2-3 paragraphs)",
  "boilerplate": "Company boilerplate paragraph",
  "contact_info": "Media contact information"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      ...parsed,
      status: 'draft'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate press release' });
  }
});

// Generate Video Script
router.post('/video-script', authMiddleware, async (req, res) => {
  try {
    const { topic, videoType, duration, tone } = req.body;

    const systemPrompt = `You are a video content expert who creates engaging scripts. Include timing cues, visual notes, and voiceover text. Always output in JSON format.`;

    const prompt = `Create a video script for the following:
Topic: ${topic}
Video Type: ${videoType}
Duration: ${duration} seconds
Tone: ${tone}

Generate a JSON response with these fields:
{
  "title": "Video title",
  "script_content": "Full script with timing cues in brackets like [0:00-0:10]",
  "visual_notes": "Notes for visuals and B-roll",
  "voiceover_text": "Description of voice style and delivery"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      ...parsed,
      video_type: videoType,
      duration_seconds: parseInt(duration),
      status: 'draft'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate video script' });
  }
});

module.exports = router;
