import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'General Inquiry',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate sending message with friendly confirmation
    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        inquiryType: 'General Inquiry',
        subject: '',
        message: ''
      });
    }, 600);
  };

  return (
    <div className="contact-container container">
      <header className="page-header">
        <span className="badge-glow">📬 We&apos;d Love to Hear From You</span>
        <h1>Contact & Support</h1>
        <p>Have questions about your dream journal, feature suggestions, or business inquiries? Drop us a note.</p>
      </header>

      <div className="contact-layout">
        {/* Contact Info Panel */}
        <div className="contact-info-card">
          <h2>Direct Communication</h2>
          <p>
            Our dedicated support team is available to assist you with account questions, technical issues, or privacy inquiries.
          </p>

          <div className="contact-details">
            <div className="contact-detail-item">
              <span className="detail-icon">✉️</span>
              <div>
                <strong>Support & Inquiries</strong>
                <p>support@dreamjournal.app</p>
              </div>
            </div>

            <div className="contact-detail-item">
              <span className="detail-icon">🛡️</span>
              <div>
                <strong>Privacy & Data Compliance</strong>
                <p>privacy@dreamjournal.app</p>
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
          
          {submitted ? (
            <div className="contact-success-state">
              <div className="success-icon">✅</div>
              <h3>Thank You for Reaching Out!</h3>
              <p>Your message has been received. Our team will review your inquiry and get back to you shortly.</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
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
                    <option value="Account Support">Account & Technical Support</option>
                    <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                    <option value="Partnership & Press">Partnership & Press</option>
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
