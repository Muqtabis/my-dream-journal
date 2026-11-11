import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        {/* Brand / Mission Column */}
        <div className="footer-col footer-brand">
          <h3>🌙 Dream Journal</h3>
          <p>
            An intelligent subconscious journaling platform and AI-powered dream visualizer. 
            Blending analytical depth psychology with generative intelligence for deeper personal insight.
          </p>
          <div className="footer-tagline">
            Empowering mindful self-discovery through dream reflection.
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/visualizer">🎨 AI Dream Visualizer</Link></li>
            <li><Link to="/journal">📖 Dream Archive</Link></li>
            <li><Link to="/stats">📊 Subconscious Insights</Link></li>
          </ul>
        </div>

        {/* Trust & Legal Column */}
        <div className="footer-col">
          <h4>Trust &amp; Transparency</h4>
          <ul>
            <li><Link to="/about">About Us &amp; Methodology</Link></li>
            <li><Link to="/contact">Contact &amp; Support</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>
            © {currentYear} Dream Journal — Built by{' '}
            <a href="https://muqtabis.github.io/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
              Muqtabis Ahmar
            </a>{' '}
            •{' '}
            <a href="https://github.com/Muqtabis/my-dream-journal" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
              GitHub
            </a>
          </p>
          <p className="disclaimer-note">
            Disclaimer: AI interpretations and visual prompts are provided for creative journaling, self-reflection, and personal exploration purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
