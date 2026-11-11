import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { isUnavailableBackendResponse } from '../utils/localDreamStore';

const CONTACT_ENDPOINT = process.env.REACT_APP_CONTACT_ENDPOINT || '';
const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || '';
const PORTFOLIO_URL = 'https://muqtabis.github.io/';
const GITHUB_REPO_URL = 'https://github.com/Muqtabis/my-dream-journal';
const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;

const INITIAL_FORM = {
  name: '',
  email: '',
  inquiryType: 'General Inquiry',
  subject: '',
  message: ''
};

const ContactPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submittedMode, setSubmittedMode] = useState(null); // 'api' | 'redirect' | null
  const [actionHref, setActionHref] = useState('');
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const buildFallbackActionLink = (data) => {
    const title = `[${data.inquiryType}] ${data.subject}`;
    const body = `**From:** ${data.name}${data.email ? ` (${data.email})` : ''}\n**Topic:** ${data.inquiryType}\n\n${data.message}`;

    if (SUPPORT_EMAIL) {
      return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    }
    return `${GITHUB_ISSUES_URL}/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);

    const targetUrl = CONTACT_ENDPOINT || `${API_BASE_URL}/api/contact`;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok && !isUnavailableBackendResponse(response)) {
        setSubmittedMode('api');
        setFormData(INITIAL_FORM);
        return;
      }

      if (!isUnavailableBackendResponse(response)) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error || 'Could not submit inquiry.');
      }

      setActionHref(buildFallbackActionLink(formData));
      setSubmittedMode('redirect');
      setFormData(INITIAL_FORM);
    } catch (err) {
      if (err?.name === 'TypeError' || /failed to fetch|networkerror/i.test(err?.message || '')) {
        setActionHref(buildFallbackActionLink(formData));
        setSubmittedMode('redirect');
        setFormData(INITIAL_FORM);
      } else {
        setError(err.message || 'Unable to send message right now.');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="contact-container container">
      <header className="page-header">
        <span className="badge-glow">📬 Connect &amp; Feedback</span>
        <h1>Contact &amp; Support</h1>
        <p>Have feedback on the AI Dream Visualizer, bug reports, or collaboration ideas? Reach out below.</p>
      </header>

      <div className="contact-layout">
        {/* Contact Info Panel */}
        <div className="contact-info-card">
          <h2>Direct Channels</h2>
          <p>
            Dream Journal is an open-source project built as a live interactive web app. Use any verified channel below to get in touch.
          </p>

          <div className="contact-details">
            <div className="contact-detail-item">
              <span className="detail-icon">💬</span>
              <div>
                <strong>GitHub Issue &amp; Feedback Tracker</strong>
                <p>
                  <a href={GITHUB_ISSUES_URL} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>
                    Submit Feedback / Report Bug on GitHub
                  </a>
                </p>
              </div>
            </div>

            <div className="contact-detail-item">
              <span className="detail-icon">🌐</span>
              <div>
                <strong>Developer Portfolio</strong>
                <p>
                  <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>
                    Muqtabis Ahmar Portfolio
                  </a>
                </p>
              </div>
            </div>

            {SUPPORT_EMAIL && (
              <div className="contact-detail-item">
                <span className="detail-icon">✉️</span>
                <div>
                  <strong>Support Email</strong>
                  <p>{SUPPORT_EMAIL}</p>
                </div>
              </div>
            )}

            <div className="contact-detail-item">
              <span className="detail-icon">💻</span>
              <div>
                <strong>Source Code Repository</strong>
                <p>
                  <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>
                    Muqtabis/my-dream-journal
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="contact-faq-callout">
            <h4>💡 Quick Tip</h4>
            <p>
              Looking for interpretation tips or privacy details? Check out our <Link to="/about">About &amp; Methodology</Link> or our <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Interactive Contact Form */}
        <div className="contact-form-card">
          <h2>Send a Message</h2>
          
          {submittedMode ? (
            <div className="contact-success-state">
              <div className="success-icon">✅</div>
              <h3>
                {submittedMode === 'api'
                  ? 'Thank You for Reaching Out!'
                  : 'Your Message Draft Is Ready!'}
              </h3>
              <p>
                {submittedMode === 'api'
                  ? 'Your inquiry has been delivered successfully. We will review your note shortly.'
                  : (SUPPORT_EMAIL
                      ? 'Click below to launch your default email client with your message pre-filled.'
                      : 'Click below to submit your pre-filled message directly on our GitHub feedback tracker.')}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {submittedMode === 'redirect' && actionHref && (
                  <a
                    href={actionHref}
                    target={SUPPORT_EMAIL ? undefined : '_blank'}
                    rel={SUPPORT_EMAIL ? undefined : 'noreferrer'}
                    className="btn-action-primary"
                    style={{ textDecoration: 'none', flex: 'none' }}
                  >
                    {SUPPORT_EMAIL ? '✉️ Open in Email App' : '🚀 Submit via GitHub'}
                  </a>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setSubmittedMode(null)}
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name <span className="req">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address <span className="req">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inquiryType">Topic / Inquiry Type</label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Account Support">Account &amp; Technical Support</option>
                    <option value="Feedback & Suggestions">Feedback &amp; Suggestions</option>
                    <option value="Partnership & Press">Collaboration &amp; Portfolio</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject <span className="req">*</span></label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Brief description of your inquiry"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message <span className="req">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  placeholder="How can we help you today? Please share as many details as possible."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <div className="error-alert">{error}</div>}

              <button
                type="submit"
                className="btn-submit-contact"
                disabled={isSending}
              >
                {isSending ? 'Sending Message...' : '✉️ Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
