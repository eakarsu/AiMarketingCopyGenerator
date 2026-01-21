import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Configure axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Context
const AuthContext = React.createContext(null);

const useAuth = () => React.useContext(AuthContext);

// Icons
const Icons = {
  Dashboard: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  AdCopy: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  Email: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Social: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
  Product: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Blog: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  Landing: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Tagline: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
  SEO: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Press: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Video: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Plus: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Back: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Sparkles: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
};

// Features Configuration
const features = [
  { id: 'ad-copies', name: 'Ad Copies', icon: Icons.AdCopy, description: 'Create compelling ad copy for any platform', path: '/ad-copies' },
  { id: 'email-campaigns', name: 'Email Campaigns', icon: Icons.Email, description: 'Design email campaigns that convert', path: '/email-campaigns' },
  { id: 'social-posts', name: 'Social Media Posts', icon: Icons.Social, description: 'Generate engaging social media content', path: '/social-posts' },
  { id: 'product-descriptions', name: 'Product Descriptions', icon: Icons.Product, description: 'Write product descriptions that sell', path: '/product-descriptions' },
  { id: 'blog-posts', name: 'Blog Posts', icon: Icons.Blog, description: 'Create SEO-optimized blog content', path: '/blog-posts' },
  { id: 'landing-pages', name: 'Landing Pages', icon: Icons.Landing, description: 'Build high-converting landing page copy', path: '/landing-pages' },
  { id: 'taglines', name: 'Taglines & Slogans', icon: Icons.Tagline, description: 'Craft memorable brand taglines', path: '/taglines' },
  { id: 'seo-content', name: 'SEO Meta Content', icon: Icons.SEO, description: 'Optimize your meta titles and descriptions', path: '/seo-content' },
  { id: 'press-releases', name: 'Press Releases', icon: Icons.Press, description: 'Write professional press releases', path: '/press-releases' },
  { id: 'video-scripts', name: 'Video Scripts', icon: Icons.Video, description: 'Create engaging video scripts', path: '/video-scripts' }
];

// Login Page
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const autoFill = () => {
    setEmail('demo@aimarketing.com');
    setPassword('demo123');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>AI Marketing Copy Generator</h1>
          <p>Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <button type="button" className="auto-fill-btn" onClick={autoFill}>
            Click to auto-fill demo credentials
          </button>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Sidebar
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>AI Marketing</h1>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <Icons.Dashboard />
          Dashboard
        </div>

        {features.map((feature) => (
          <div
            key={feature.id}
            className={`nav-item ${location.pathname.startsWith(feature.path) ? 'active' : ''}`}
            onClick={() => navigate(feature.path)}
          >
            <feature.icon />
            {feature.name}
          </div>
        ))}
      </nav>

      <div className="user-menu">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      const endpoints = features.map(f => f.id);
      const results = await Promise.all(
        endpoints.map(endpoint =>
          api.get(`/${endpoint}`).then(res => ({ [endpoint]: res.data.length })).catch(() => ({ [endpoint]: 0 }))
        )
      );
      setCounts(Object.assign({}, ...results));
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="cards-grid">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="feature-card"
            onClick={() => navigate(feature.path)}
          >
            <div className="feature-card-icon">
              <feature.icon />
            </div>
            <h3>{feature.name}</h3>
            <p>{feature.description}</p>
            <div className="feature-card-count">
              <span>Total items</span>
              <strong>{counts[feature.id] || 0}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic Feature Page Component
function FeaturePage({ feature, columns, formFields, aiEndpoint, aiFields }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedItem(null);
    setLoading(true);
    fetchItems();
  }, [feature.id]);

  const fetchItems = async () => {
    try {
      const response = await api.get(`/${feature.id}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

  const handleNewItem = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const response = await api.post(`/ai/${aiEndpoint}`, formData);
      setFormData({ ...formData, ...response.data });
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate content. Please check your OpenRouter API key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.post(`/${feature.id}`, formData);
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/${feature.id}/${id}`);
        setSelectedItem(null);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (selectedItem) {
    return (
      <div>
        <div className="back-btn" onClick={handleBack}>
          <Icons.Back /> Back to list
        </div>
        <div className="detail-container">
          <div className="detail-header">
            <div>
              <h2 className="detail-title">{selectedItem[columns[0].key] || selectedItem.title || selectedItem.headline || selectedItem.product_name || selectedItem.page_name}</h2>
              <div className="detail-meta">
                <span>Created: {new Date(selectedItem.created_at).toLocaleDateString()}</span>
                {selectedItem.status && <span className={`status-badge ${selectedItem.status}`}>{selectedItem.status}</span>}
              </div>
            </div>
            <button className="btn btn-danger" onClick={() => handleDelete(selectedItem.id)}>Delete</button>
          </div>
          <div className="detail-content">
            {Object.entries(selectedItem).map(([key, value]) => {
              if (['id', 'user_id', 'created_at', 'updated_at'].includes(key)) return null;
              return (
                <div key={key} className="detail-section">
                  <h4>{key.replace(/_/g, ' ')}</h4>
                  <p>{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>{feature.name}</h1>
        <button className="btn btn-primary" onClick={handleNewItem}>
          <Icons.Plus /> New {feature.name.slice(0, -1)}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <feature.icon />
          <h3>No {feature.name.toLowerCase()} yet</h3>
          <p>Create your first one to get started</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} onClick={() => handleRowClick(item)}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.key === 'status' ? (
                        <span className={`status-badge ${item[col.key]}`}>{item[col.key]}</span>
                      ) : col.key === 'created_at' ? (
                        new Date(item[col.key]).toLocaleDateString()
                      ) : (
                        String(item[col.key] || '').substring(0, 50) + (String(item[col.key] || '').length > 50 ? '...' : '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New {feature.name.slice(0, -1)}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {aiFields && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '16px', color: '#818cf8' }}>AI Generation</h4>
                  {aiFields.map((field) => (
                    <div key={field.key} className="form-group">
                      <label>{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateAI}
                    disabled={generating}
                    style={{ width: '100%', marginBottom: '20px' }}
                  >
                    <Icons.Sparkles /> {generating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
              )}

              <h4 style={{ marginBottom: '16px', color: '#94a3b8' }}>Content Fields</h4>
              {formFields.map((field) => (
                <div key={field.key} className="form-group">
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Feature Page Configurations
const featureConfigs = {
  'ad-copies': {
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'platform', label: 'Platform' },
      { key: 'target_audience', label: 'Audience' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'title', label: 'Title', placeholder: 'Ad title' },
      { key: 'platform', label: 'Platform', type: 'select', options: ['Facebook', 'Google Ads', 'Instagram', 'LinkedIn', 'TikTok', 'Twitter', 'YouTube'] },
      { key: 'target_audience', label: 'Target Audience', placeholder: 'e.g., Young professionals 25-35' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Exciting', 'Urgent', 'Informative'] },
      { key: 'content', label: 'Ad Content', type: 'textarea', placeholder: 'Ad copy text' },
      { key: 'cta', label: 'Call to Action', placeholder: 'e.g., Shop Now' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] }
    ],
    aiEndpoint: 'ad-copy',
    aiFields: [
      { key: 'product', label: 'Product/Service', placeholder: 'Describe your product or service' },
      { key: 'platform', label: 'Platform', type: 'select', options: ['Facebook', 'Google Ads', 'Instagram', 'LinkedIn', 'TikTok'] },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who is this ad for?' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Exciting', 'Urgent'] }
    ]
  },
  'email-campaigns': {
    columns: [
      { key: 'subject', label: 'Subject' },
      { key: 'campaign_type', label: 'Type' },
      { key: 'target_segment', label: 'Segment' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'subject', label: 'Subject Line', placeholder: 'Email subject' },
      { key: 'campaign_type', label: 'Campaign Type', type: 'select', options: ['Welcome', 'Newsletter', 'Promotional', 'Re-engagement', 'Transactional'] },
      { key: 'target_segment', label: 'Target Segment', placeholder: 'e.g., New subscribers' },
      { key: 'preview_text', label: 'Preview Text', placeholder: 'Email preview text' },
      { key: 'body', label: 'Email Body', type: 'textarea', placeholder: 'Email content' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'scheduled', 'sent'] }
    ],
    aiEndpoint: 'email-campaign',
    aiFields: [
      { key: 'purpose', label: 'Email Purpose', placeholder: 'What is this email about?' },
      { key: 'campaignType', label: 'Campaign Type', type: 'select', options: ['Welcome', 'Newsletter', 'Promotional', 'Re-engagement'] },
      { key: 'targetSegment', label: 'Target Segment', placeholder: 'Who will receive this?' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Urgent', 'Informative'] }
    ]
  },
  'social-posts': {
    columns: [
      { key: 'platform', label: 'Platform' },
      { key: 'content', label: 'Content' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'] },
      { key: 'content', label: 'Post Content', type: 'textarea', placeholder: 'Your social media post' },
      { key: 'hashtags', label: 'Hashtags', placeholder: '#marketing #ai' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'scheduled', 'published'] }
    ],
    aiEndpoint: 'social-post',
    aiFields: [
      { key: 'topic', label: 'Topic', placeholder: 'What is this post about?' },
      { key: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'] },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Funny', 'Inspirational'] }
    ]
  },
  'product-descriptions': {
    columns: [
      { key: 'product_name', label: 'Product' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'product_name', label: 'Product Name', placeholder: 'Product name' },
      { key: 'category', label: 'Category', placeholder: 'e.g., Electronics' },
      { key: 'short_description', label: 'Short Description', type: 'textarea', placeholder: 'Brief product description' },
      { key: 'long_description', label: 'Long Description', type: 'textarea', placeholder: 'Detailed product description' },
      { key: 'key_features', label: 'Key Features', type: 'textarea', placeholder: 'List key features' },
      { key: 'seo_keywords', label: 'SEO Keywords', placeholder: 'keyword1, keyword2' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] }
    ],
    aiEndpoint: 'product-description',
    aiFields: [
      { key: 'productName', label: 'Product Name', placeholder: 'What is the product?' },
      { key: 'category', label: 'Category', placeholder: 'Product category' },
      { key: 'keyFeatures', label: 'Key Features', placeholder: 'Main features to highlight' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who is this product for?' }
    ]
  },
  'blog-posts': {
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'seo_score', label: 'SEO Score' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'title', label: 'Title', placeholder: 'Blog post title' },
      { key: 'slug', label: 'Slug', placeholder: 'url-friendly-slug' },
      { key: 'category', label: 'Category', placeholder: 'e.g., Marketing' },
      { key: 'meta_description', label: 'Meta Description', type: 'textarea', placeholder: 'SEO meta description' },
      { key: 'content', label: 'Content', type: 'textarea', placeholder: 'Blog post content' },
      { key: 'tags', label: 'Tags', placeholder: 'tag1, tag2, tag3' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] }
    ],
    aiEndpoint: 'blog-post',
    aiFields: [
      { key: 'topic', label: 'Topic', placeholder: 'What should the blog be about?' },
      { key: 'category', label: 'Category', placeholder: 'Blog category' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who will read this?' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Educational', 'Inspiring'] }
    ]
  },
  'landing-pages': {
    columns: [
      { key: 'page_name', label: 'Page Name' },
      { key: 'headline', label: 'Headline' },
      { key: 'conversion_rate', label: 'Conv. Rate' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'page_name', label: 'Page Name', placeholder: 'Landing page name' },
      { key: 'headline', label: 'Headline', placeholder: 'Main headline' },
      { key: 'subheadline', label: 'Subheadline', placeholder: 'Supporting headline' },
      { key: 'body_content', label: 'Body Content', type: 'textarea', placeholder: 'Page content' },
      { key: 'cta_text', label: 'CTA Text', placeholder: 'Button text' },
      { key: 'cta_url', label: 'CTA URL', placeholder: '/signup' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] }
    ],
    aiEndpoint: 'landing-page',
    aiFields: [
      { key: 'productService', label: 'Product/Service', placeholder: 'What are you promoting?' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who is this page for?' },
      { key: 'goal', label: 'Goal', placeholder: 'e.g., Sign up for free trial' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Exciting', 'Trustworthy', 'Urgent'] }
    ]
  },
  'taglines': {
    columns: [
      { key: 'brand_name', label: 'Brand' },
      { key: 'tagline', label: 'Tagline' },
      { key: 'category', label: 'Category' },
      { key: 'style', label: 'Style' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'brand_name', label: 'Brand Name', placeholder: 'Your brand name' },
      { key: 'tagline', label: 'Tagline', placeholder: 'The tagline' },
      { key: 'category', label: 'Category', placeholder: 'e.g., Technology' },
      { key: 'style', label: 'Style', type: 'select', options: ['Powerful', 'Friendly', 'Inspiring', 'Professional', 'Fun'] },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft'] }
    ],
    aiEndpoint: 'tagline',
    aiFields: [
      { key: 'brandName', label: 'Brand Name', placeholder: 'Your brand name' },
      { key: 'industry', label: 'Industry', placeholder: 'Your industry' },
      { key: 'values', label: 'Brand Values', placeholder: 'Core values to convey' },
      { key: 'style', label: 'Style', type: 'select', options: ['Powerful', 'Friendly', 'Inspiring', 'Professional'] }
    ]
  },
  'seo-content': {
    columns: [
      { key: 'page_url', label: 'Page URL' },
      { key: 'meta_title', label: 'Meta Title' },
      { key: 'seo_score', label: 'SEO Score' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'page_url', label: 'Page URL', placeholder: '/your-page' },
      { key: 'meta_title', label: 'Meta Title', placeholder: 'SEO title (60 chars max)' },
      { key: 'meta_description', label: 'Meta Description', type: 'textarea', placeholder: 'SEO description (160 chars max)' },
      { key: 'focus_keyword', label: 'Focus Keyword', placeholder: 'Main keyword' },
      { key: 'secondary_keywords', label: 'Secondary Keywords', placeholder: 'keyword1, keyword2' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft'] }
    ],
    aiEndpoint: 'seo-content',
    aiFields: [
      { key: 'pageUrl', label: 'Page URL', placeholder: '/your-page' },
      { key: 'pageContent', label: 'Page Content/Topic', placeholder: 'What is this page about?' },
      { key: 'targetKeyword', label: 'Target Keyword', placeholder: 'Main keyword to rank for' }
    ]
  },
  'press-releases': {
    columns: [
      { key: 'headline', label: 'Headline' },
      { key: 'dateline', label: 'Dateline' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'headline', label: 'Headline', placeholder: 'Press release headline' },
      { key: 'subheadline', label: 'Subheadline', placeholder: 'Supporting headline' },
      { key: 'dateline', label: 'Dateline', placeholder: 'CITY, Date' },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Press release content' },
      { key: 'boilerplate', label: 'Boilerplate', type: 'textarea', placeholder: 'Company boilerplate' },
      { key: 'contact_info', label: 'Contact Info', placeholder: 'Media contact details' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] }
    ],
    aiEndpoint: 'press-release',
    aiFields: [
      { key: 'announcement', label: 'Announcement', placeholder: 'What are you announcing?' },
      { key: 'companyName', label: 'Company Name', placeholder: 'Your company name' },
      { key: 'companyInfo', label: 'Company Info', placeholder: 'Brief company description' }
    ]
  },
  'video-scripts': {
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'video_type', label: 'Type' },
      { key: 'duration_seconds', label: 'Duration (s)' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'title', label: 'Title', placeholder: 'Video title' },
      { key: 'video_type', label: 'Video Type', type: 'select', options: ['YouTube', 'TikTok', 'Instagram Reels', 'Facebook Ad', 'LinkedIn Ad', 'Promotional'] },
      { key: 'duration_seconds', label: 'Duration (seconds)', type: 'number', placeholder: '60' },
      { key: 'script_content', label: 'Script', type: 'textarea', placeholder: 'Video script with timing cues' },
      { key: 'visual_notes', label: 'Visual Notes', type: 'textarea', placeholder: 'Notes for visuals' },
      { key: 'voiceover_text', label: 'Voiceover Notes', placeholder: 'Voice style description' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] }
    ],
    aiEndpoint: 'video-script',
    aiFields: [
      { key: 'topic', label: 'Topic', placeholder: 'Video topic' },
      { key: 'videoType', label: 'Video Type', type: 'select', options: ['YouTube', 'TikTok', 'Instagram Reels', 'Facebook Ad', 'Promotional'] },
      { key: 'duration', label: 'Duration (seconds)', placeholder: '60' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Energetic', 'Educational'] }
    ]
  }
};

// Layout Component
function Layout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Main App
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, login, logout }}>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        {features.map((feature) => (
          <Route
            key={feature.id}
            path={feature.path}
            element={
              <ProtectedRoute>
                <Layout>
                  <FeaturePage
                    feature={feature}
                    {...featureConfigs[feature.id]}
                  />
                </Layout>
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
