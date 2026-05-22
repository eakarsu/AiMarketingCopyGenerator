import React, { useState, useEffect, useCallback, createContext, useContext, useRef, Component } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AIToolsPage from './AIToolsPage';
import CustomViewsPage from './pages/CustomViewsPage';
import OfferMessageFit from './pages/OfferMessageFit';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

// ==================== API Configuration ====================
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== Contexts ====================
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);

const ConfirmContext = createContext(null);
const useConfirm = () => useContext(ConfirmContext);

// ==================== Toast Provider ====================
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '\u2713' : toast.type === 'error' ? '\u2717' : '\u2139'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ==================== Confirm Dialog ====================
function ConfirmDialog({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 2000 }}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className={`confirm-dialog-icon ${variant || 'danger'}`}>
          <Icons.Warning />
        </div>
        <h3>{title || 'Confirm Action'}</h3>
        <p>{message || 'Are you sure you want to proceed?'}</p>
        <div className="confirm-dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelText || 'Cancel'}</button>
          <button className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmProvider({ children }) {
  const [state, setState] = useState({ isOpen: false });
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise(resolve => {
      resolveRef.current = resolve;
      setState({ isOpen: true, ...options });
    });
  }, []);

  const handleConfirm = () => {
    setState({ isOpen: false });
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setState({ isOpen: false });
    resolveRef.current?.(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={state.isOpen}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

// ==================== Error Boundary ====================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">!</div>
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button className="btn btn-primary" onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}>
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==================== Icons ====================
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
  SEOOptimizer: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Tone: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  ABTest: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Headline: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Globe: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  ),
  Edit: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Search: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Download: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  SortAsc: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  SortDesc: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Trash: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Menu: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  User: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Key: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Warning: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  PDF: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Shield: () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
};

// ==================== Features ====================
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
  { id: 'video-scripts', name: 'Video Scripts', icon: Icons.Video, description: 'Create engaging video scripts', path: '/video-scripts' },
  { id: 'seo-optimizations', name: 'AI SEO Optimizer', icon: Icons.SEOOptimizer, description: 'Optimize any content for better SEO', path: '/seo-optimizations' },
  { id: 'tone-adjustments', name: 'AI Tone Adjuster', icon: Icons.Tone, description: 'Adjust the tone of any text content', path: '/tone-adjustments' },
  { id: 'ab-variations', name: 'A/B Variation Generator', icon: Icons.ABTest, description: 'Generate A/B test variations', path: '/ab-variations' },
  { id: 'headline-scores', name: 'AI Headline Scorer', icon: Icons.Headline, description: 'Score and improve your headlines', path: '/headline-scores' },
  { id: 'localizations', name: 'AI Localization Engine', icon: Icons.Globe, description: 'Translate and localize content', path: '/localizations' }
];

// ==================== Validation ====================
function validateForm(formData, formFields) {
  const errors = {};
  formFields.forEach((field, index) => {
    const value = formData[field.key];
    if (index < 2 && field.key !== 'status') {
      if (!value || !String(value).trim()) {
        errors[field.key] = `${field.label} is required`;
        return;
      }
    }
    if (field.type === 'number' && value !== undefined && value !== '') {
      const num = Number(value);
      if (isNaN(num)) {
        errors[field.key] = `${field.label} must be a number`;
      } else if ((field.key.includes('score') || field.key.includes('rate')) && (num < 0 || num > 100)) {
        errors[field.key] = `${field.label} must be between 0 and 100`;
      }
    }
    if (field.type === 'textarea' && value && value.length > 10000) {
      errors[field.key] = `${field.label} must be under 10,000 characters`;
    }
  });
  return errors;
}

// ==================== Export Utilities ====================
function exportToCSV(items, columns, filename) {
  const headers = columns.map(c => c.label);
  const rows = items.map(item =>
    columns.map(col => {
      let val = item[col.key] ?? '';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    })
  );
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(items, columns, title) {
  const printWindow = window.open('', '_blank');
  const tableRows = items.map(item =>
    `<tr>${columns.map(col => `<td>${item[col.key] ?? ''}</td>`).join('')}</tr>`
  ).join('');
  printWindow.document.write(`<!DOCTYPE html><html><head><title>${title} Export</title>
    <style>
      body{font-family:Arial,sans-serif;padding:20px;color:#333}
      h1{color:#6366f1;margin-bottom:5px}
      .meta{color:#666;margin-bottom:20px;font-size:14px}
      table{border-collapse:collapse;width:100%}
      th{background:#6366f1;color:white;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase}
      td{padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px}
      tr:nth-child(even){background:#f8fafc}
      @media print{body{padding:0}h1{font-size:18px}}
    </style></head><body>
    <h1>${title}</h1>
    <p class="meta">Exported on ${new Date().toLocaleDateString()} | ${items.length} items</p>
    <table><thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody></table></body></html>`);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 250);
}

// ==================== Loading Skeleton ====================
function LoadingSkeleton({ type }) {
  if (type === 'table') {
    return (
      <div className="skeleton-container">
        <div className="skeleton-header"><div className="skeleton-line w-200"></div><div className="skeleton-line w-120"></div></div>
        <div className="skeleton-toolbar"><div className="skeleton-line w-300"></div><div className="skeleton-line w-150"></div></div>
        <div className="skeleton-table">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-row">
              {[...Array(5)].map((_, j) => (<div key={j} className="skeleton-cell"><div className="skeleton-line"></div></div>))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === 'cards') {
    return (
      <div className="cards-grid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line w-48 h-48"></div>
            <div className="skeleton-line w-150 h-20"></div>
            <div className="skeleton-line w-200 h-14"></div>
            <div className="skeleton-line w-full h-14" style={{ marginTop: 16 }}></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="skeleton-container">
      <div className="skeleton-line w-300 h-24"></div>
      <div className="skeleton-line w-full"></div>
      <div className="skeleton-line w-200"></div>
    </div>
  );
}

// ==================== Login Page ====================
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password.trim()) { setError('Password is required'); return; }
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
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
          </div>
          {error && <div className="form-error-message">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="login-links">
            <span className="login-link" onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Forgot Password Page ====================
function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>
          {error && <div className="form-error-message">{error}</div>}
          {message && <div className="form-success-message">{message}</div>}
          {resetToken && (
            <div className="demo-token-box">
              <p><strong>Demo Mode:</strong> Use this token to reset your password</p>
              <code>{resetToken}</code>
              <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}
                onClick={() => navigate(`/reset-password?token=${resetToken}`)}>
                Reset Password Now
              </button>
            </div>
          )}
          {!resetToken && (
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          )}
          <div className="login-links">
            <span className="login-link" onClick={() => navigate('/login')}>Back to Login</span>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Reset Password Page ====================
function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Set New Password</h1>
          <p>Enter your new password below</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
          </div>
          {error && <div className="form-error-message">{error}</div>}
          {message && <div className="form-success-message">{message}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <div className="login-links">
            <span className="login-link" onClick={() => navigate('/login')}>Back to Login</span>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Profile Page ====================
function ProfilePage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const [profileData, setProfileData] = useState({ name: '', company: '', phone: '', bio: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', company: user.company || '', phone: user.phone || '', bio: user.bio || '' });
    }
  }, [user]);

  const handleProfileSave = async () => {
    const errors = {};
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!profileData.company.trim()) errors.company = 'Company is required';
    if (Object.keys(errors).length > 0) { setProfileErrors(errors); return; }
    setSaving(true);
    setProfileErrors({});
    try {
      const response = await api.put('/auth/profile', profileData);
      const token = localStorage.getItem('token');
      login(token, response.data);
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) errors.newPassword = 'Min 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setPasswordErrors(errors); return; }
    setChangingPassword(true);
    setPasswordErrors({});
    try {
      await api.put('/auth/change-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast('Password changed successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <div className="page-header"><h1>My Profile</h1></div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <Icons.User />
            <h3>Personal Information</h3>
          </div>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={profileData.name} onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))} />
            {profileErrors.name && <span className="field-error">{profileErrors.name}</span>}
          </div>
          <div className="form-group">
            <label>Company</label>
            <input type="text" value={profileData.company} onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))} />
            {profileErrors.company && <span className="field-error">{profileErrors.company}</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" value={profileData.phone} onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone number" />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea value={profileData.bio} onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell us about yourself" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <div className="role-badge"><Icons.Shield /> {user?.role || 'admin'}</div>
          </div>
          <button className="btn btn-primary" onClick={handleProfileSave} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
        <div className="profile-card">
          <div className="profile-card-header">
            <Icons.Key />
            <h3>Change Password</h3>
          </div>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} />
            {passwordErrors.currentPassword && <span className="field-error">{passwordErrors.currentPassword}</span>}
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Min 6 characters" />
            {passwordErrors.newPassword && <span className="field-error">{passwordErrors.newPassword}</span>}
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} />
            {passwordErrors.confirmPassword && <span className="field-error">{passwordErrors.confirmPassword}</span>}
          </div>
          <button className="btn btn-primary" onClick={handlePasswordChange} disabled={changingPassword} style={{ width: '100%' }}>
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== Sidebar ====================
function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <h1>AI Marketing</h1>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}><Icons.Close /></button>
        </div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={() => handleNav('/')}>
            <Icons.Dashboard /> Dashboard
          </div>
          <div className={`nav-item ${location.pathname === '/ai-tools' ? 'active' : ''}`} onClick={() => handleNav('/ai-tools')}>
            <Icons.AdCopy /> AI Tools
          </div>
          <div className={`nav-item ${location.pathname === '/copy-views' ? 'active' : ''}`} onClick={() => handleNav('/copy-views')}>
            <Icons.Dashboard /> Copy Views
          </div>
          <div className={`nav-item ${location.pathname === '/offer-message-fit' ? 'active' : ''}`} onClick={() => handleNav('/offer-message-fit')}>
            <Icons.Tagline /> Offer Fit
          </div>
          {features.map((feature) => (
            <div key={feature.id} className={`nav-item ${location.pathname.startsWith(feature.path) ? 'active' : ''}`}
              onClick={() => handleNav(feature.path)}>
              <feature.icon /> {feature.name}
            </div>
          ))}
        </nav>
        <div className="user-menu">
          <div className="user-info" onClick={() => handleNav('/profile')} style={{ cursor: 'pointer' }}>
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <div className="user-menu-actions">
            <button className="profile-btn" onClick={() => handleNav('/profile')}>Edit Profile</button>
            <button className="logout-btn" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== Dashboard ====================
function Dashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCounts = async () => {
      const endpoints = features.map(f => f.id);
      const results = await Promise.all(
        endpoints.map(endpoint =>
          api.get(`/${endpoint}`).then(res => ({ [endpoint]: res.data.length })).catch(() => ({ [endpoint]: 0 }))
        )
      );
      setCounts(Object.assign({}, ...results));
      setLoading(false);
    };
    fetchCounts();
  }, []);

  if (loading) return <LoadingSkeleton type="cards" />;

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name || 'User'}! You have {totalItems} total items across all features.</p>
        </div>
      </div>
      <div className="cards-grid">
        {features.map((feature) => (
          <div key={feature.id} className="feature-card" onClick={() => navigate(feature.path)}>
            <div className="feature-card-icon"><feature.icon /></div>
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

// ==================== AI Output Display ====================
function AIOutputDisplay({ data, title }) {
  if (!data) return null;

  const renderValue = (key, value) => {
    if (value === null || value === undefined) return null;
    if (key.includes('score') && typeof value === 'number') {
      const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';
      return (
        <div className="ai-score-display">
          <div className="ai-score-bar"><div className="ai-score-fill" style={{ width: `${value}%`, backgroundColor: color }}></div></div>
          <span className="ai-score-value" style={{ color }}>{value}/100</span>
        </div>
      );
    }
    if (typeof value === 'string' && (value.includes('\n') || value.length > 100)) {
      return <pre className="ai-content-block">{value}</pre>;
    }
    return <span className="ai-value">{String(value)}</span>;
  };

  const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="ai-output-container">
      {title && <h3 className="ai-output-title"><Icons.Sparkles /> {title}</h3>}
      <div className="ai-output-grid">
        {Object.entries(data).map(([key, value]) => {
          if (['id', 'user_id', 'created_at', 'updated_at', 'status'].includes(key)) return null;
          return (
            <div key={key} className="ai-output-item">
              <label className="ai-output-label">{formatLabel(key)}</label>
              {renderValue(key, value)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== Feature Page (Enhanced) ====================
function FeaturePage({ feature, columns, formFields, aiEndpoint, aiFields }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // New feature state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [formErrors, setFormErrors] = useState({});

  const ITEMS_PER_PAGE = 10;
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  useEffect(() => {
    setSelectedItem(null);
    setLoading(true);
    setAiResult(null);
    setSearchTerm('');
    setStatusFilter('all');
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
    setSelectedIds(new Set());
    setFormErrors({});
    fetchItems();
  }, [feature.id]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

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

  // Filter
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || columns.some(col =>
      String(item[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] ?? '';
    const bVal = b[sortConfig.key] ?? '';
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = sortedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const uniqueStatuses = [...new Set(items.map(item => item.status).filter(Boolean))];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedItems.map(item => item.id)));
    }
  };

  const handleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Selected Items',
      message: `Are you sure you want to delete ${selectedIds.size} item(s)? This action cannot be undone.`,
      confirmText: `Delete ${selectedIds.size} Items`,
      variant: 'danger'
    });
    if (confirmed) {
      try {
        await Promise.all([...selectedIds].map(id => api.delete(`/${feature.id}/${id}`)));
        addToast(`${selectedIds.size} item(s) deleted successfully`, 'success');
        setSelectedIds(new Set());
        fetchItems();
      } catch (error) {
        addToast('Failed to delete some items', 'error');
      }
    }
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsEditing(false);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setAiResult(null);
    setFormErrors({});
  };

  const handleNewItem = () => {
    if (!canEdit) { addToast('You do not have permission to create items', 'error'); return; }
    setFormData({});
    setAiResult(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = () => {
    if (!canEdit) { addToast('You do not have permission to edit items', 'error'); return; }
    setFormData({ ...selectedItem });
    setFormErrors({});
    setIsEditing(true);
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    setAiResult(null);
    try {
      const response = await api.post(`/ai/${aiEndpoint}`, formData);
      setAiResult(response.data);
      setFormData(prev => ({ ...prev, ...response.data }));
      addToast('AI content generated successfully', 'success');
    } catch (error) {
      addToast('Failed to generate content. Check your OpenRouter API key.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    const errors = validateForm(formData, formFields);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Please fix the validation errors before saving', 'error');
      return;
    }
    try {
      await api.post(`/${feature.id}`, formData);
      setShowModal(false);
      setFormErrors({});
      setAiResult(null);
      addToast('Item created successfully', 'success');
      fetchItems();
    } catch (error) {
      addToast('Failed to save item', 'error');
    }
  };

  const handleUpdate = async () => {
    const errors = validateForm(formData, formFields);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Please fix the validation errors before saving', 'error');
      return;
    }
    try {
      await api.put(`/${feature.id}/${selectedItem.id}`, formData);
      setIsEditing(false);
      setFormErrors({});
      setSelectedItem({ ...selectedItem, ...formData });
      addToast('Item updated successfully', 'success');
      fetchItems();
    } catch (error) {
      addToast('Failed to update item', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!canEdit) { addToast('You do not have permission to delete items', 'error'); return; }
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (confirmed) {
      try {
        await api.delete(`/${feature.id}/${id}`);
        setSelectedItem(null);
        addToast('Item deleted successfully', 'success');
        fetchItems();
      } catch (error) {
        addToast('Failed to delete item', 'error');
      }
    }
  };

  const getEmptyState = () => {
    if (items.length === 0) return { title: `No ${feature.name.toLowerCase()} yet`, message: 'Create your first one to get started!', icon: feature.icon, showCreate: true };
    if (searchTerm && filteredItems.length === 0) return { title: `No results for "${searchTerm}"`, message: 'Try adjusting your search term or clearing filters.', icon: Icons.Search, showCreate: false };
    if (statusFilter !== 'all' && filteredItems.length === 0) return { title: `No "${statusFilter}" items`, message: 'Try selecting a different filter or clear the current one.', icon: Icons.Filter, showCreate: false };
    return null;
  };

  const renderFormField = (field, data, setData, errors) => (
    <div key={field.key} className="form-group">
      <label>{field.label} {field.key !== 'status' && formFields.indexOf(field) < 2 && <span className="required-star">*</span>}</label>
      {field.type === 'textarea' ? (
        <textarea value={data[field.key] || ''} onChange={(e) => setData(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} className={errors[field.key] ? 'input-error' : ''} />
      ) : field.type === 'select' ? (
        <select value={data[field.key] || ''} onChange={(e) => setData(prev => ({ ...prev, [field.key]: e.target.value }))} className={errors[field.key] ? 'input-error' : ''}>
          <option value="">Select {field.label}</option>
          {field.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
        </select>
      ) : (
        <input type={field.type || 'text'} value={data[field.key] || ''} onChange={(e) => setData(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} className={errors[field.key] ? 'input-error' : ''} />
      )}
      {errors[field.key] && <span className="field-error">{errors[field.key]}</span>}
    </div>
  );

  if (loading) return <LoadingSkeleton type="table" />;

  // Detail View
  if (selectedItem) {
    if (isEditing) {
      return (
        <div>
          <div className="back-btn" onClick={() => setIsEditing(false)}><Icons.Back /> Cancel editing</div>
          <div className="detail-container">
            <div className="detail-header"><h2>Edit {feature.name.slice(0, -1)}</h2></div>
            <div className="edit-form">
              {formFields.map((field) => renderFormField(field, formData, setFormData, formErrors))}
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="back-btn" onClick={handleBack}><Icons.Back /> Back to list</div>
        <div className="detail-container">
          <div className="detail-header">
            <div>
              <h2 className="detail-title">{selectedItem[columns[0].key] || selectedItem.title || selectedItem.headline || selectedItem.product_name || selectedItem.page_name || selectedItem.original_content?.substring(0, 50)}</h2>
              <div className="detail-meta">
                <span>Created: {new Date(selectedItem.created_at).toLocaleDateString()}</span>
                {selectedItem.status && <span className={`status-badge ${selectedItem.status}`}>{selectedItem.status}</span>}
              </div>
            </div>
            {canEdit && (
              <div className="detail-actions">
                <button className="btn btn-secondary" onClick={handleEdit}><Icons.Edit /> Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(selectedItem.id)}><Icons.Trash /> Delete</button>
              </div>
            )}
          </div>
          <AIOutputDisplay data={selectedItem} />
        </div>
      </div>
    );
  }

  // List View
  const emptyState = getEmptyState();

  return (
    <div>
      <div className="page-header">
        <h1>{feature.name}</h1>
        <div className="page-header-actions">
          {canEdit && (
            <button className="btn btn-primary" onClick={handleNewItem}><Icons.Plus /> New</button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Icons.Search />
            <input type="text" placeholder={`Search ${feature.name.toLowerCase()}...`} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button className="search-clear" onClick={() => setSearchTerm('')}>&times;</button>}
          </div>
          <div className="filter-box">
            <Icons.Filter />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              {uniqueStatuses.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-sm btn-secondary" onClick={() => exportToCSV(filteredItems, columns, feature.id)} title="Export CSV">
            <Icons.Download /> CSV
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => exportToPDF(filteredItems, columns, feature.name)} title="Export PDF">
            <Icons.PDF /> PDF
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && canEdit && (
        <div className="bulk-toolbar">
          <span>{selectedIds.size} item(s) selected</span>
          <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}><Icons.Trash /> Delete Selected</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setSelectedIds(new Set())}>Clear Selection</button>
        </div>
      )}

      {emptyState ? (
        <div className="empty-state">
          <emptyState.icon />
          <h3>{emptyState.title}</h3>
          <p>{emptyState.message}</p>
          {emptyState.showCreate && canEdit && (
            <button className="btn btn-primary" onClick={handleNewItem} style={{ marginTop: 16 }}>
              <Icons.Plus /> Create First {feature.name.slice(0, -1)}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {canEdit && (
                    <th style={{ width: 40 }}>
                      <input type="checkbox" checked={selectedIds.size === paginatedItems.length && paginatedItems.length > 0}
                        onChange={handleSelectAll} className="table-checkbox" />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th key={col.key} onClick={() => handleSort(col.key)} className="sortable-header">
                      <div className="th-content">
                        {col.label}
                        <span className="sort-icon">
                          {sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? <Icons.SortAsc /> : <Icons.SortDesc />) : null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id} onClick={() => handleRowClick(item)} className={selectedIds.has(item.id) ? 'row-selected' : ''}>
                    {canEdit && (
                      <td onClick={(e) => e.stopPropagation()} style={{ width: 40 }}>
                        <input type="checkbox" checked={selectedIds.has(item.id)} onChange={(e) => handleSelectOne(item.id, e)} className="table-checkbox" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.key === 'status' ? (
                          <span className={`status-badge ${item[col.key]}`}>{item[col.key]}</span>
                        ) : col.key === 'created_at' ? (
                          new Date(item[col.key]).toLocaleDateString()
                        ) : col.key.includes('score') && typeof item[col.key] === 'number' ? (
                          <span className={`score-badge ${item[col.key] >= 80 ? 'high' : item[col.key] >= 60 ? 'medium' : 'low'}`}>
                            {item[col.key]}
                          </span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedItems.length)} of {sortedItems.length}
              </div>
              <div className="pagination-controls">
                <button className="pagination-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
                <button className="pagination-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                  <Icons.ChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (totalPages <= 7 || Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages) {
                    return (
                      <button key={page} className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}>{page}</button>
                    );
                  }
                  if (Math.abs(page - currentPage) === 3) return <span key={page} className="pagination-dots">...</span>;
                  return null;
                })}
                <button className="pagination-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                  <Icons.ChevronRight />
                </button>
                <button className="pagination-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New {feature.name.slice(0, -1)}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {aiFields && (
                <div className="ai-generation-section">
                  <h4><Icons.Sparkles /> AI Generation</h4>
                  {aiExamplePresets[feature.id] && (
                    <div className="ai-examples">
                      <span className="ai-examples-label">Try an example:</span>
                      {aiExamplePresets[feature.id].map((example) => (
                        <button key={example.label} type="button" className="btn-example"
                          onClick={() => setFormData(prev => ({ ...prev, ...example.values }))}>{example.label}</button>
                      ))}
                    </div>
                  )}
                  {aiFields.map((field) => (
                    <div key={field.key} className="form-group">
                      <label>{field.label}</label>
                      {field.type === 'select' ? (
                        <select value={formData[field.key] || ''} onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}>
                          <option value="">Select {field.label}</option>
                          {field.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      ) : (
                        <input type="text" value={formData[field.key] || ''} onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} />
                      )}
                    </div>
                  ))}
                  <button className="btn btn-primary btn-generate" onClick={handleGenerateAI} disabled={generating}>
                    <Icons.Sparkles /> {generating ? 'Generating...' : 'Generate with AI'}
                  </button>
                  {aiResult && <AIOutputDisplay data={aiResult} title="AI Generated Content" />}
                </div>
              )}
              <div className="content-fields-section">
                <h4>Content Fields</h4>
                {formFields.map((field) => renderFormField(field, formData, setFormData, formErrors))}
              </div>
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

// ==================== AI Example Presets ====================
const aiExamplePresets = {
  'ad-copies': [
    { label: 'Fitness App', values: { product: 'FitPro - AI fitness tracking app with personalized workouts', platform: 'Instagram', targetAudience: 'Health-conscious millennials 25-35', tone: 'Exciting' } },
    { label: 'SaaS Product', values: { product: 'CloudSync - project management tool for remote teams', platform: 'LinkedIn', targetAudience: 'Small business owners and team leads', tone: 'Professional' } }
  ],
  'email-campaigns': [
    { label: 'Welcome Email', values: { purpose: 'Welcome new subscribers and introduce the brand story', campaignType: 'Welcome', targetSegment: 'New subscribers', tone: 'Friendly' } },
    { label: 'Flash Sale', values: { purpose: 'Announce 48-hour flash sale with 40% off all products', campaignType: 'Promotional', targetSegment: 'Active customers', tone: 'Urgent' } }
  ],
  'social-posts': [
    { label: 'Product Launch', values: { topic: 'Launching a new eco-friendly reusable water bottle line', platform: 'Instagram', tone: 'Casual' } },
    { label: 'Industry Tips', values: { topic: '5 remote work productivity tips for 2024', platform: 'LinkedIn', tone: 'Professional' } }
  ],
  'product-descriptions': [
    { label: 'Smart Watch', values: { productName: 'ProFit Smart Watch X1', category: 'Wearable Technology', keyFeatures: 'Heart rate monitor, GPS tracking, 7-day battery, waterproof to 50m', targetAudience: 'Fitness enthusiasts aged 25-45' } },
    { label: 'Organic Serum', values: { productName: 'GlowNatural Vitamin C Serum', category: 'Beauty & Skincare', keyFeatures: '20% Vitamin C, hyaluronic acid, organic ingredients, anti-aging', targetAudience: 'Women 25-50 interested in natural skincare' } }
  ],
  'blog-posts': [
    { label: 'AI Marketing', values: { topic: 'How AI is transforming digital marketing strategies', category: 'Marketing', targetAudience: 'Marketing professionals and CMOs', tone: 'Educational' } },
    { label: 'Startup Growth', values: { topic: '10 growth hacking strategies for early-stage startups', category: 'Business', targetAudience: 'Startup founders and entrepreneurs', tone: 'Inspiring' } }
  ],
  'landing-pages': [
    { label: 'SaaS Free Trial', values: { productService: 'AI-powered email marketing platform', targetAudience: 'Small business owners', goal: 'Sign up for 14-day free trial', tone: 'Professional' } },
    { label: 'Webinar Signup', values: { productService: 'Digital marketing masterclass webinar', targetAudience: 'Marketing beginners and career changers', goal: 'Register for free webinar', tone: 'Exciting' } }
  ],
  'taglines': [
    { label: 'Tech Startup', values: { brandName: 'NovaTech', industry: 'Technology', values: 'Innovation, simplicity, reliability', style: 'Inspiring' } },
    { label: 'Coffee Brand', values: { brandName: 'BrewCraft', industry: 'Food & Beverage', values: 'Artisanal quality, sustainability, community', style: 'Friendly' } }
  ],
  'seo-content': [
    { label: 'Product Page', values: { pageUrl: '/products/smart-home-hub', pageContent: 'Smart home automation hub that connects all your devices', targetKeyword: 'smart home hub' } },
    { label: 'Service Page', values: { pageUrl: '/services/web-design', pageContent: 'Professional web design and development services for businesses', targetKeyword: 'web design services' } }
  ],
  'press-releases': [
    { label: 'Funding Round', values: { announcement: 'Closed $10M Series A funding round led by top VC firm', companyName: 'InnovateTech', companyInfo: 'AI-powered productivity tools startup founded in 2022' } },
    { label: 'Product Launch', values: { announcement: 'Launching revolutionary eco-friendly packaging solution', companyName: 'GreenPack Solutions', companyInfo: 'Sustainable packaging company reducing single-use plastic waste' } }
  ],
  'video-scripts': [
    { label: 'Product Demo', values: { topic: 'Showcase features of new AI project management app', videoType: 'YouTube', duration: '120', tone: 'Professional' } },
    { label: 'TikTok Ad', values: { topic: 'Quick transformation using organic skincare products', videoType: 'TikTok', duration: '15', tone: 'Energetic' } }
  ],
  'seo-optimizations': [
    { label: 'Weak Homepage', values: { content: 'We sell the best software for businesses. Our tool is great and helps teams work better.', contentType: 'Homepage', targetKeywords: 'business software, team productivity, workflow automation' } },
    { label: 'Product Page', values: { content: 'Buy our shoes. They are comfortable and look nice. Good for walking and running.', contentType: 'Product Page', targetKeywords: 'comfortable walking shoes, premium running footwear' } }
  ],
  'tone-adjustments': [
    { label: 'Formal to Friendly', values: { text: 'Dear valued customer, we regret to inform you that your subscription will expire in 30 days. Please renew at your earliest convenience.', targetTone: 'Friendly', context: 'Subscription renewal email' } },
    { label: 'Casual to Professional', values: { text: 'Hey! We just dropped this amazing new feature and it is gonna blow your mind! Check it out ASAP!', targetTone: 'Professional', context: 'Product update announcement' } }
  ],
  'ab-variations': [
    { label: 'CTA Button', values: { content: 'Sign Up Now', contentType: 'CTA Button', testGoal: 'Increase free trial signups by 20%' } },
    { label: 'Email Subject', values: { content: 'Check out our latest features and updates', contentType: 'Email Subject', testGoal: 'Improve email open rates above 25%' } }
  ],
  'headline-scores': [
    { label: 'Strong Headline', values: { headline: '10 Proven Strategies to Double Your Revenue in 90 Days', industry: 'Marketing' } },
    { label: 'Weak Headline', values: { headline: 'New Software Update Available Now', industry: 'Technology' } }
  ],
  'localizations': [
    { label: 'English to Spanish', values: { content: 'Unlock your potential with our award-winning platform. Start your free trial today!', sourceLanguage: 'English', targetLanguage: 'Spanish', contentType: 'Marketing Copy', region: 'Latin America' } },
    { label: 'English to Japanese', values: { content: 'Premium noise-cancelling headphones. Experience music like never before.', sourceLanguage: 'English', targetLanguage: 'Japanese', contentType: 'Product Description', region: 'Japan' } }
  ]
};

// ==================== Feature Configs ====================
const featureConfigs = {
  'ad-copies': {
    columns: [
      { key: 'title', label: 'Title' }, { key: 'platform', label: 'Platform' }, { key: 'target_audience', label: 'Audience' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
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
      { key: 'subject', label: 'Subject' }, { key: 'campaign_type', label: 'Type' }, { key: 'target_segment', label: 'Segment' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
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
      { key: 'platform', label: 'Platform' }, { key: 'content', label: 'Content' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
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
      { key: 'product_name', label: 'Product' }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'product_name', label: 'Product Name', placeholder: 'Product name' },
      { key: 'category', label: 'Category', placeholder: 'e.g., Electronics' },
      { key: 'short_description', label: 'Short Description', type: 'textarea', placeholder: 'Brief description' },
      { key: 'long_description', label: 'Long Description', type: 'textarea', placeholder: 'Detailed description' },
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
      { key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'seo_score', label: 'SEO Score' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
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
      { key: 'page_name', label: 'Page Name' }, { key: 'headline', label: 'Headline' }, { key: 'conversion_rate', label: 'Conv. Rate' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
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
      { key: 'brand_name', label: 'Brand' }, { key: 'tagline', label: 'Tagline' }, { key: 'category', label: 'Category' }, { key: 'style', label: 'Style' }, { key: 'status', label: 'Status' }
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
      { key: 'page_url', label: 'Page URL' }, { key: 'meta_title', label: 'Meta Title' }, { key: 'seo_score', label: 'SEO Score' }, { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'page_url', label: 'Page URL', placeholder: '/your-page' },
      { key: 'meta_title', label: 'Meta Title', placeholder: 'SEO title' },
      { key: 'meta_description', label: 'Meta Description', type: 'textarea', placeholder: 'SEO description' },
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
      { key: 'headline', label: 'Headline' }, { key: 'dateline', label: 'Dateline' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
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
      { key: 'title', label: 'Title' }, { key: 'video_type', label: 'Type' }, { key: 'duration_seconds', label: 'Duration (s)' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
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
  },
  'seo-optimizations': {
    columns: [
      { key: 'content_type', label: 'Content Type' }, { key: 'seo_score_before', label: 'Before' }, { key: 'seo_score_after', label: 'After' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'original_content', label: 'Original Content', type: 'textarea', placeholder: 'Paste your content here' },
      { key: 'optimized_content', label: 'Optimized Content', type: 'textarea', placeholder: 'SEO-optimized version' },
      { key: 'content_type', label: 'Content Type', type: 'select', options: ['Homepage', 'Product Page', 'Blog Post', 'Landing Page', 'About Page', 'Other'] },
      { key: 'keywords_added', label: 'Keywords Added', placeholder: 'keyword1, keyword2' },
      { key: 'readability_score', label: 'Readability Score', type: 'number', placeholder: '0-100' },
      { key: 'seo_score_before', label: 'SEO Score Before', type: 'number', placeholder: '0-100' },
      { key: 'seo_score_after', label: 'SEO Score After', type: 'number', placeholder: '0-100' },
      { key: 'suggestions', label: 'Suggestions', type: 'textarea', placeholder: 'SEO improvement suggestions' },
      { key: 'status', label: 'Status', type: 'select', options: ['completed', 'draft'] }
    ],
    aiEndpoint: 'seo-optimization',
    aiFields: [
      { key: 'content', label: 'Content to Optimize', placeholder: 'Paste your content here' },
      { key: 'contentType', label: 'Content Type', type: 'select', options: ['Homepage', 'Product Page', 'Blog Post', 'Landing Page', 'About Page'] },
      { key: 'targetKeywords', label: 'Target Keywords', placeholder: 'Keywords to optimize for' }
    ]
  },
  'tone-adjustments': {
    columns: [
      { key: 'original_tone', label: 'From Tone' }, { key: 'target_tone', label: 'To Tone' }, { key: 'context', label: 'Context' }, { key: 'confidence_score', label: 'Confidence' }, { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'original_text', label: 'Original Text', type: 'textarea', placeholder: 'Enter the original text' },
      { key: 'adjusted_text', label: 'Adjusted Text', type: 'textarea', placeholder: 'Tone-adjusted version' },
      { key: 'original_tone', label: 'Original Tone', placeholder: 'Detected original tone' },
      { key: 'target_tone', label: 'Target Tone', type: 'select', options: ['Professional', 'Friendly', 'Casual', 'Formal', 'Empathetic', 'Urgent', 'Playful', 'Confident'] },
      { key: 'context', label: 'Context', placeholder: 'e.g., Email, Social Post' },
      { key: 'confidence_score', label: 'Confidence Score', type: 'number', placeholder: '0-100' },
      { key: 'status', label: 'Status', type: 'select', options: ['completed', 'draft'] }
    ],
    aiEndpoint: 'tone-adjustment',
    aiFields: [
      { key: 'text', label: 'Text to Adjust', placeholder: 'Enter the text to adjust' },
      { key: 'targetTone', label: 'Target Tone', type: 'select', options: ['Professional', 'Friendly', 'Casual', 'Formal', 'Empathetic', 'Urgent', 'Playful', 'Confident'] },
      { key: 'context', label: 'Context', placeholder: 'Where will this be used?' }
    ]
  },
  'ab-variations': {
    columns: [
      { key: 'content_type', label: 'Type' }, { key: 'test_goal', label: 'Test Goal' }, { key: 'recommended_variant', label: 'Recommended' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'original_content', label: 'Original Content', type: 'textarea', placeholder: 'Original content to create variations for' },
      { key: 'content_type', label: 'Content Type', type: 'select', options: ['CTA Button', 'Headline', 'Email Subject', 'Ad Copy', 'Landing Page', 'Product Description'] },
      { key: 'variation_a', label: 'Variation A', type: 'textarea', placeholder: 'First variation' },
      { key: 'variation_b', label: 'Variation B', type: 'textarea', placeholder: 'Second variation' },
      { key: 'variation_c', label: 'Variation C', type: 'textarea', placeholder: 'Third variation (optional)' },
      { key: 'hypothesis', label: 'Hypothesis', type: 'textarea', placeholder: 'What each variation tests' },
      { key: 'test_goal', label: 'Test Goal', placeholder: 'e.g., Increase click-through rate' },
      { key: 'recommended_variant', label: 'Recommended Variant', type: 'select', options: ['A', 'B', 'C'] },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'draft'] }
    ],
    aiEndpoint: 'ab-variation',
    aiFields: [
      { key: 'content', label: 'Original Content', placeholder: 'Content to create variations for' },
      { key: 'contentType', label: 'Content Type', type: 'select', options: ['CTA Button', 'Headline', 'Email Subject', 'Ad Copy', 'Landing Page'] },
      { key: 'testGoal', label: 'Test Goal', placeholder: 'What do you want to improve?' }
    ]
  },
  'headline-scores': {
    columns: [
      { key: 'headline', label: 'Headline' }, { key: 'overall_score', label: 'Score' }, { key: 'emotional_score', label: 'Emotional' }, { key: 'clarity_score', label: 'Clarity' }, { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'headline', label: 'Headline', placeholder: 'Enter your headline' },
      { key: 'overall_score', label: 'Overall Score', type: 'number', placeholder: '0-100' },
      { key: 'emotional_score', label: 'Emotional Score', type: 'number', placeholder: '0-100' },
      { key: 'power_words_score', label: 'Power Words Score', type: 'number', placeholder: '0-100' },
      { key: 'length_score', label: 'Length Score', type: 'number', placeholder: '0-100' },
      { key: 'clarity_score', label: 'Clarity Score', type: 'number', placeholder: '0-100' },
      { key: 'seo_score', label: 'SEO Score', type: 'number', placeholder: '0-100' },
      { key: 'suggestions', label: 'Suggestions', type: 'textarea', placeholder: 'Improvement suggestions' },
      { key: 'improved_headlines', label: 'Improved Headlines', type: 'textarea', placeholder: 'Better headline versions' },
      { key: 'status', label: 'Status', type: 'select', options: ['completed', 'draft'] }
    ],
    aiEndpoint: 'headline-score',
    aiFields: [
      { key: 'headline', label: 'Headline to Score', placeholder: 'Enter your headline' },
      { key: 'industry', label: 'Industry', placeholder: 'Your industry (optional)' }
    ]
  },
  'localizations': {
    columns: [
      { key: 'source_language', label: 'From' }, { key: 'target_language', label: 'To' }, { key: 'region', label: 'Region' }, { key: 'quality_score', label: 'Quality' }, { key: 'created_at', label: 'Created' }
    ],
    formFields: [
      { key: 'original_content', label: 'Original Content', type: 'textarea', placeholder: 'Content to localize' },
      { key: 'source_language', label: 'Source Language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Italian'] },
      { key: 'target_language', label: 'Target Language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Italian', 'Korean', 'Arabic', 'Hindi', 'Russian'] },
      { key: 'localized_content', label: 'Localized Content', type: 'textarea', placeholder: 'Translated and localized version' },
      { key: 'content_type', label: 'Content Type', type: 'select', options: ['Marketing Copy', 'Product Description', 'Email', 'Social Post', 'Website', 'App UI'] },
      { key: 'cultural_notes', label: 'Cultural Notes', type: 'textarea', placeholder: 'Cultural adaptations made' },
      { key: 'region', label: 'Target Region', placeholder: 'e.g., Latin America, Germany' },
      { key: 'quality_score', label: 'Quality Score', type: 'number', placeholder: '0-100' },
      { key: 'status', label: 'Status', type: 'select', options: ['completed', 'draft'] }
    ],
    aiEndpoint: 'localization',
    aiFields: [
      { key: 'content', label: 'Content to Localize', placeholder: 'Enter your content' },
      { key: 'sourceLanguage', label: 'Source Language', type: 'select', options: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'] },
      { key: 'targetLanguage', label: 'Target Language', type: 'select', options: ['Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Italian', 'Korean', 'Arabic', 'Hindi', 'Russian'] },
      { key: 'contentType', label: 'Content Type', type: 'select', options: ['Marketing Copy', 'Product Description', 'Email', 'Social Post', 'Website'] },
      { key: 'region', label: 'Target Region', placeholder: 'e.g., Brazil, France, Japan' }
    ]
  }
};

// ==================== Layout ====================
function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-container">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="main-content">
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}><Icons.Menu /></button>
          <h1 className="mobile-logo">AI Marketing</h1>
        </div>
        {children}
      </main>
    </div>
  );
}

// ==================== Protected Route ====================
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ==================== App ====================
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
    <ErrorBoundary>
      <AuthContext.Provider value={{ isAuthenticated: !!token, user, login, logout }}>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

              <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
              <Route path="/ai-tools" element={<ProtectedRoute><Layout><AIToolsPage /></Layout></ProtectedRoute>} />
              <Route path="/copy-views" element={<ProtectedRoute><Layout><CustomViewsPage /></Layout></ProtectedRoute>} />
              <Route path="/offer-message-fit" element={<ProtectedRoute><Layout><OfferMessageFit /></Layout></ProtectedRoute>} />
              {features.map((feature) => (
                <Route key={feature.id} path={feature.path} element={
                  <ProtectedRoute><Layout><FeaturePage feature={feature} {...featureConfigs[feature.id]} /></Layout></ProtectedRoute>
                } />
              ))}
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
