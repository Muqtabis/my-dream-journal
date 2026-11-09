import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="about-container container">
      <header className="page-header">
        <span className="badge-glow">🌟 Our Mission & Architecture</span>
        <h1>About Dream Journal</h1>
        <p>Bridging ancient dream psychology with modern artificial intelligence.</p>
      </header>

      <div className="about-content">
        <section className="about-card">
          <h2>🌙 What is Dream Journal?</h2>
          <p>
            Humans spend approximately one-third of their lives sleeping, experiencing thousands of vivid subconscious narratives. Yet, historically, most dreams evaporate within minutes of waking, leaving their rich symbolism and emotional lessons unexamined.
          </p>
          <p>
            <strong>Dream Journal</strong> was created to solve this. It is a mindful digital sanctuary that empowers individuals to capture, catalog, decode, and visualize their subconscious experiences. By combining a private cloud journal with generative AI, we transform fleeting nighttime thoughts into lasting self-knowledge and artistic expression.
          </p>
        </section>

        <section className="about-grid">
          <div className="about-feature-box">
            <div className="feature-icon">🧠</div>
            <h3>Analytical Depth Psychology</h3>
            <p>
              Our dream interpretation engine draws upon analytical psychology—specifically the theories of Carl Jung. It analyzes latent themes, archetypes (The Shadow, The Anima/Animus, The Threshold), and recurring symbols to offer meaningful perspectives on waking life challenges.
            </p>
          </div>

          <div className="about-feature-box">
            <div className="feature-icon">🎨</div>
            <h3>Generative Art & Visualizer</h3>
            <p>
              Dreams are inherently visual. Our AI agent acts as a specialized visual prompt engineer, translating abstract emotional themes into sensory parameters (lighting, color palette, composition, surrealism) to render your dream as high-resolution artwork.
            </p>
          </div>

          <div className="about-feature-box">
            <div className="feature-icon">📊</div>
            <h3>Pattern & Mood Tracking</h3>
            <p>
              Over time, your journal becomes a personal psychological landscape. Our interactive analytics, calendar heatmaps, mood curves, and tag clouds help you discover emotional cycles and long-term subconscious trends.
            </p>
          </div>

          <div className="about-feature-box">
            <div className="feature-icon">🔒</div>
            <h3>Privacy-First Philosophy</h3>
            <p>
              Subconscious reflections require absolute trust. We prioritize encrypted authentication, isolated user spaces, and minimal data retention. We never sell your personal narratives or compromise your privacy.
            </p>
          </div>
        </section>

        <section className="about-card team-mission">
          <h2>✨ The Technology Stack</h2>
          <p>
            Dream Journal is built on a modern, high-performance technology stack:
          </p>
          <ul>
            <li><strong>Frontend:</strong> React, responsive CSS Grid/Flexbox architecture, dynamic themes, Chart.js analytics, and Calendar Heatmap visualization.</li>
            <li><strong>Backend API:</strong> Node.js, Express REST API, JSON Web Token (JWT) stateless auth, and bcrypt encryption.</li>
            <li><strong>Database:</strong> MongoDB Atlas cloud cluster for scalable dream archiving.</li>
            <li><strong>AI Intelligence:</strong> Google Gemini 2.5 Flash for deep contextual reasoning, structured archetype classification, and prompt synthesis.</li>
          </ul>

          <div className="about-cta-row">
            <Link to="/visualizer" className="btn-about-action">Try the AI Dream Visualizer</Link>
            <Link to="/contact" className="btn-about-secondary">Get in Touch With Us</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
