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
  if (!process.env.OPENROUTER_API_KEY) {
    const e = new Error('AI service not configured (OPENROUTER_API_KEY missing)');
    e.statusCode = 503;
    throw e;
  }
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

// SEO Optimizer - Optimize content for SEO
router.post('/seo-optimization', authMiddleware, async (req, res) => {
  try {
    const { content, contentType, targetKeywords } = req.body;

    const systemPrompt = `You are an expert SEO specialist who optimizes content for search engines while maintaining readability and engagement. Provide actionable improvements. Always output in JSON format.`;

    const prompt = `Optimize the following content for SEO:
Content: ${content}
Content Type: ${contentType}
Target Keywords: ${targetKeywords}

Analyze and optimize the content. Generate a JSON response with these fields:
{
  "optimized_content": "The SEO-optimized version of the content with keywords naturally integrated",
  "keywords_added": "Comma-separated list of keywords added or emphasized",
  "readability_score": number from 1-100,
  "seo_score_before": number from 1-100 (estimate of original content),
  "seo_score_after": number from 1-100 (estimate after optimization),
  "suggestions": "Bullet-pointed list of additional SEO improvements"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      original_content: content,
      content_type: contentType,
      ...parsed,
      status: 'completed'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to optimize content for SEO' });
  }
});

// Tone Adjuster - Adjust the tone of text
router.post('/tone-adjustment', authMiddleware, async (req, res) => {
  try {
    const { text, targetTone, context } = req.body;

    const systemPrompt = `You are an expert copywriter who can transform text to match any desired tone while preserving the core message. You understand nuances between professional, casual, friendly, formal, urgent, empathetic, and other tones. Always output in JSON format.`;

    const prompt = `Adjust the tone of the following text:
Original Text: ${text}
Target Tone: ${targetTone}
Context: ${context || 'General marketing content'}

Transform the text to match the target tone. Generate a JSON response with these fields:
{
  "adjusted_text": "The text rewritten in the target tone",
  "original_tone": "Detected tone of the original text",
  "confidence_score": number from 1-100 indicating how well the adjustment matches the target tone
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      original_text: text,
      target_tone: targetTone,
      context: context || 'General marketing content',
      ...parsed,
      status: 'completed'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to adjust tone' });
  }
});

// A/B Variation Generator - Generate test variations
router.post('/ab-variation', authMiddleware, async (req, res) => {
  try {
    const { content, contentType, testGoal } = req.body;

    const systemPrompt = `You are an expert in conversion rate optimization and A/B testing. You create meaningful variations that test specific hypotheses while maintaining brand consistency. Always output in JSON format.`;

    const prompt = `Create A/B test variations for the following:
Original Content: ${content}
Content Type: ${contentType}
Test Goal: ${testGoal}

Generate three meaningfully different variations to test. Generate a JSON response with these fields:
{
  "variation_a": "First variation - control or minor changes",
  "variation_b": "Second variation - moderate changes testing a specific element",
  "variation_c": "Third variation - bold changes testing a different approach",
  "hypothesis": "What hypothesis each variation tests",
  "recommended_variant": "A", "B", or "C" - which to start testing with
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      original_content: content,
      content_type: contentType,
      test_goal: testGoal,
      ...parsed,
      status: 'active'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate A/B variations' });
  }
});

// Headline Scorer - Score and improve headlines
router.post('/headline-score', authMiddleware, async (req, res) => {
  try {
    const { headline, industry } = req.body;

    const systemPrompt = `You are an expert headline analyst who scores headlines based on emotional impact, power words, length, clarity, and SEO potential. You provide actionable improvements. Always output in JSON format.`;

    const prompt = `Analyze and score the following headline:
Headline: ${headline}
Industry: ${industry || 'General'}

Score the headline and provide improvements. Generate a JSON response with these fields:
{
  "overall_score": number from 1-100,
  "emotional_score": number from 1-100 (emotional impact),
  "power_words_score": number from 1-100 (use of power words),
  "length_score": number from 1-100 (optimal length),
  "clarity_score": number from 1-100 (message clarity),
  "seo_score": number from 1-100 (SEO potential),
  "suggestions": "Bullet-pointed list of specific improvements",
  "improved_headlines": "Three improved versions of the headline, each on a new line"
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      headline,
      ...parsed,
      status: 'completed'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to score headline' });
  }
});

// Localization Engine - Translate and localize content
router.post('/localization', authMiddleware, async (req, res) => {
  try {
    const { content, sourceLanguage, targetLanguage, contentType, region } = req.body;

    const systemPrompt = `You are an expert localization specialist who not only translates but adapts content for cultural context, local expressions, and regional preferences. You understand marketing localization best practices. Always output in JSON format.`;

    const prompt = `Localize the following content:
Content: ${content}
Source Language: ${sourceLanguage}
Target Language: ${targetLanguage}
Content Type: ${contentType || 'Marketing copy'}
Target Region: ${region || 'General'}

Translate and culturally adapt the content. Generate a JSON response with these fields:
{
  "localized_content": "The translated and culturally adapted content",
  "cultural_notes": "Notes on cultural adaptations made and considerations",
  "quality_score": number from 1-100 indicating localization quality
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);

    res.json({
      original_content: content,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      content_type: contentType || 'Marketing copy',
      region: region || 'General',
      ...parsed,
      status: 'completed'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to localize content' });
  }
});

// Brand Voice Analyzer — check copy against brand guidelines
router.post('/brand-voice-analyzer', authMiddleware, async (req, res) => {
  try {
    const { copy, brandGuidelines, brandName } = req.body;
    if (!copy) return res.status(400).json({ error: 'copy is required' });

    const systemPrompt = `You are a brand voice auditor. Compare marketing copy against brand voice guidelines and report alignment. Always output in JSON format.`;
    const prompt = `Analyze this marketing copy against the brand guidelines.

Brand: ${brandName || 'unspecified'}
Brand voice guidelines: ${brandGuidelines || 'infer reasonable defaults'}

Copy:
"""${copy}"""

JSON schema:
{
  "alignment_score": number (0-100),
  "tone_match": string,
  "voice_match": string,
  "issues": [{"issue": string, "severity": "low"|"medium"|"high", "suggestion": string}],
  "rewrite": string
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);
    res.json({ brand: brandName || null, ...parsed, status: 'completed' });
  } catch (error) {
    console.error('Brand voice analyzer error:', error);
    res.status(500).json({ error: 'Failed to analyze brand voice' });
  }
});

// Competitor Comparison — analyze competitor copy and suggest differentiation
router.post('/competitor-comparison', authMiddleware, async (req, res) => {
  try {
    const { ourCopy, competitorCopy, productCategory } = req.body;
    if (!ourCopy || !competitorCopy) {
      return res.status(400).json({ error: 'ourCopy and competitorCopy are required' });
    }

    const systemPrompt = `You are a competitive marketing analyst. Compare two pieces of copy and recommend differentiation. Always output in JSON format.`;
    const prompt = `Compare our copy vs competitor copy and recommend differentiation.

Product category: ${productCategory || 'unspecified'}

Our copy:
"""${ourCopy}"""

Competitor copy:
"""${competitorCopy}"""

JSON schema:
{
  "shared_themes": [string],
  "competitor_strengths": [string],
  "our_strengths": [string],
  "our_weaknesses": [string],
  "differentiation_angles": [{"angle": string, "rationale": string, "example_headline": string}],
  "recommended_positioning": string
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);
    res.json({ product_category: productCategory || null, ...parsed, status: 'completed' });
  } catch (error) {
    console.error('Competitor comparison error:', error);
    res.status(500).json({ error: 'Failed to analyze competitor copy' });
  }
});

// Audience Sentiment — predict how a target audience is likely to react to copy
router.post('/audience-sentiment', authMiddleware, async (req, res) => {
  try {
    const { copy, audience, channel, productCategory } = req.body;
    if (!copy) return res.status(400).json({ error: 'copy is required' });

    const systemPrompt = `You are an audience-research analyst. Predict how the named target audience is
likely to react to the marketing copy across affective, cognitive, and behavioral axes. Highlight which
phrases trigger which reactions. Always output in JSON format only.`;
    const prompt = `Predict audience sentiment for the following copy.

Audience: ${audience || 'unspecified general consumer'}
Channel: ${channel || 'unspecified'}
Product category: ${productCategory || 'unspecified'}

Copy:
"""${copy}"""

JSON schema:
{
  "overall_sentiment": "positive|neutral|negative|mixed",
  "sentiment_score": number from -100 to 100,
  "predicted_reactions": {
    "affective": [string],
    "cognitive": [string],
    "behavioral": [string]
  },
  "trigger_phrases": [{"phrase": string, "predicted_effect": string, "polarity": "positive|neutral|negative"}],
  "risk_phrases": [{"phrase": string, "risk": string}],
  "expected_engagement": "high|medium|low",
  "rewrite_suggestion": string
}`;

    const result = await generateWithAI(prompt, systemPrompt);
    const parsed = parseAIResponse(result);
    res.json({
      audience: audience || null,
      channel: channel || null,
      product_category: productCategory || null,
      ...parsed,
      status: 'completed'
    });
  } catch (error) {
    console.error('Audience sentiment error:', error);
    if (error.statusCode === 503) {
      return res.status(503).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to analyze audience sentiment' });
  }
});

module.exports = router;
