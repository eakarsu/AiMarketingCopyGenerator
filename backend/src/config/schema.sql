-- AI Marketing Copy Generator Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad Copy table
CREATE TABLE IF NOT EXISTS ad_copies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    target_audience VARCHAR(255),
    tone VARCHAR(100),
    content TEXT NOT NULL,
    cta VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(100) NOT NULL,
    target_segment VARCHAR(255),
    body TEXT NOT NULL,
    preview_text VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    open_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social Media Posts table
CREATE TABLE IF NOT EXISTS social_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    platform VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT,
    scheduled_date TIMESTAMP,
    engagement_score INTEGER,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Descriptions table
CREATE TABLE IF NOT EXISTS product_descriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    short_description TEXT,
    long_description TEXT NOT NULL,
    key_features TEXT,
    seo_keywords TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    meta_description VARCHAR(500),
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT,
    word_count INTEGER,
    seo_score INTEGER,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Landing Pages table
CREATE TABLE IF NOT EXISTS landing_pages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    page_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    subheadline VARCHAR(500),
    body_content TEXT NOT NULL,
    cta_text VARCHAR(100),
    cta_url VARCHAR(500),
    conversion_rate DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taglines & Slogans table
CREATE TABLE IF NOT EXISTS taglines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    brand_name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    style VARCHAR(100),
    is_favorite BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Meta Content table
CREATE TABLE IF NOT EXISTS seo_content (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    page_url VARCHAR(500) NOT NULL,
    meta_title VARCHAR(255) NOT NULL,
    meta_description VARCHAR(500) NOT NULL,
    focus_keyword VARCHAR(100),
    secondary_keywords TEXT,
    seo_score INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Press Releases table
CREATE TABLE IF NOT EXISTS press_releases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    headline VARCHAR(255) NOT NULL,
    subheadline VARCHAR(500),
    dateline VARCHAR(100),
    body TEXT NOT NULL,
    boilerplate TEXT,
    contact_info TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video Scripts table
CREATE TABLE IF NOT EXISTS video_scripts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    video_type VARCHAR(100) NOT NULL,
    duration_seconds INTEGER,
    script_content TEXT NOT NULL,
    visual_notes TEXT,
    voiceover_text TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_copies_user ON ad_copies(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user ON email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_product_descriptions_user ON product_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_user ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_user ON landing_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_taglines_user ON taglines(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_content_user ON seo_content(user_id);
CREATE INDEX IF NOT EXISTS idx_press_releases_user ON press_releases(user_id);
CREATE INDEX IF NOT EXISTS idx_video_scripts_user ON video_scripts(user_id);
