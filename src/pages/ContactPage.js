import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { isUnavailableBackendResponse } from '../utils/localDreamStore';

const CONTACT_ENDPOINT = process.env.REACT_APP_CONTACT_ENDPOINT || '';
const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || 'support@dreamjournal.app';
const GITHUB_ISSUES_URL = 'https://github.com/Muqtabis/my-dream-journal/issues';

const INITIAL_FORM = {
  name: '',
  email: '',
  inquiryType: 'General Inquiry',
  subject: '',
  message: ''
};

const ContactPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submittedMode, setSubmittedMode] = useState(null); // 'api' | 'mailto' | null
  const [mailtoHref, setMailtoHref] = useState('');
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const buildMailtoLink = (data) => {
    const subject = `[${data.inquiryType}] ${data.subject}`;
    const body = `Name: ${data.name}\nEmail: ${data.email}\nTopic: ${data.inquiryType}\n\n${data.message}`;
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

      // Static hosting without external form endpoint configured: prepare direct email draft
      setMailtoHref(buildMailtoLink(formData));
      setSubmittedMode('mailto');
      setFormData(INITIAL_FORM);
    } catch (err) {
      if (err?.name === 'TypeError' || /failed to fetch|networkerror/i.test(err?.message || '')) {
        setMailtoHref(buildMailtoLink(formData));
        setSubmittedMode('mailto');
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
        <span className="badge-glow">📬 We&apos;d Love to Hear From You</span>
        <h1>Contact &amp; Support</h1>
        <p>Have questions about your dream journal, feature suggestions, or business inquiries? Drop us a note.</p>
      </header>

      <div className="contact-layout">
        {/* Contact Info Panel */}
        <div className="contact-info-card">
          <h2>Direct Communication</h2>
          <p>
            Our support channels are open for technical issues, feature feedback, privacy questions, and general inquiries.
          </p>

          <div className="contact-details">
            <div className="contact-detail-item">
              <span className="detail-icon">✉️</span>
              <div>
                <strong>Support &amp; Inquiries</strong>
                <p>{SUPPORT_EMAIL}</p>
              </div>
            </div>

            <div className="contact-detail-item">
              <span className="detail-icon">💬</span>
              <div>
                <strong>Public Issue &amp; Feedback Tracker</strong>
                <p>
                  <a href={GITHUB_ISSUES_URL} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>
                    Open Support Ticket on GitHub
                  </a>
                </p>
              </div>
            </div>

            <div className="contact-detail-item">
              <span className="detail-icon">⏱️</span>
              <div>
                <strong>Response Window</strong>
                <p>Monday - Friday, within 24-48 business hours</p>
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
                  ? 'Your inquiry has been delivered successfully. We will review your note and reply shortly.'
                  : 'Click below to launch your default email client with your message pre-filled, or open a ticket directly on GitHub.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {submittedMode === 'mailto' && mailtoHref && (
                  <a href={mailtoHref} className="btn-action-primary" style={{ textDecoration: 'none', flex: 'none' }}>
                    ✉️ Open in Email App
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
                    <option value="Partnership & Press">Partnership &amp; Press</option>
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
