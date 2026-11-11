import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { API_BASE_URL } from '../config';
import { analyzeDreamDirectly } from '../utils/dreamAnalyzer';

const ART_STYLES = [
  { id: 'surrealism', label: 'Surrealism (Dalí)', emoji: '🎨', prompt: 'Surrealism in the style of Salvador Dalí and René Magritte, dreamlike logic, ethereal lighting' },
  { id: 'watercolor', label: 'Ethereal Watercolor', emoji: '🌊', prompt: 'Soft ethereal watercolor painting, bleeding pastel tones, gentle washes, poetic atmosphere' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', emoji: '🌌', prompt: 'Futuristic cyberpunk neon dreamscape, glowing volumetric fog, hyper-detailed synthwave aesthetic' },
  { id: 'ghibli', label: 'Studio Ghibli', emoji: '🍃', prompt: 'Studio Ghibli anime landscape, lush hand-painted scenery, whimsical gentle sunlight, Hayao Miyazaki style' },
  { id: 'gothic', label: 'Dark Gothic Fantasy', emoji: '🕯️', prompt: 'Dark gothic fantasy, dramatic chiaroscuro shadows, misty atmosphere, Tim Burton and Guillermo del Toro aesthetic' },
  { id: 'oil', label: 'Vintage Oil Painting', emoji: '🖼️', prompt: 'Classical baroque oil painting, rich textured brushstrokes, dramatic golden hour lighting, Rembrandt style' },
  { id: 'cosmic', label: 'Cosmic Psychedelic', emoji: '✨', prompt: 'Cosmic psychedelic dream, swirling nebulae, sacred geometry, iridescent fractal light' }
];

const MOODS = [
  { id: 'mysterious', label: 'Mysterious', emoji: '🔮' },
  { id: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  { id: 'nightmare', label: 'Intense / Nightmare', emoji: '⚡' },
  { id: 'lucid', label: 'Lucid / Euphoric', emoji: '🧠' },
  { id: 'melancholic', label: 'Melancholic', emoji: '🌧️' }
];

const SAMPLE_DREAMS = [
  "I was floating above a bioluminescent purple ocean under twin moons, and when I looked down at the water, my reflection was walking on land.",
  "I was wandering in an infinite labyrinth library where books flew like birds and the pages whispered forgotten childhood memories.",
  "I was running through a desert of melting golden clocks, trying to reach a train that was floating upward into the cloudy starry sky."
];

const VisualizerPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [dreamContent, setDreamContent] = useState('');
  const [dreamTitle, setDreamTitle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(ART_STYLES[0].label);
  const [selectedMood, setSelectedMood] = useState(MOODS[0].label);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  
  const [result, setResult] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Saved dreams from local storage (for offline / static GitHub Pages mode)
  const [savedDreams, setSavedDreams] = useState([]);
  const [showSavedModal, setShowSavedModal] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('local_dreams') || '[]');
      setSavedDreams(stored);
    } catch (e) {
      console.warn('Could not parse local_dreams:', e);
    }
  }, []);

  const loadingMessages = [
    "Consulting the subconscious...",
    "Extracting Jungian archetypes & hidden symbols...",
    "Synthesizing psychological analysis...",
    "Generating custom dream art visualization..."
  ];

  const handleSampleClick = (sample) => {
    setDreamContent(sample);
    if (!dreamTitle) {
      setDreamTitle("Surreal Dream Encounter");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!dreamContent.trim()) {
      setError("Please describe what happened in your dream.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);
    setIsSaved(false);
    setSaveMessage(null);

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % loadingMessages.length;
      setLoadingStep(step);
    }, 1800);

    try {
      let data = null;

      // 1. Attempt backend endpoint first if available
      try {
        const response = await fetch(`${API_BASE_URL}/api/ai/visualize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dreamContent: dreamContent.trim(),
            artStyle: selectedStyle,
            mood: selectedMood
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success) {
            data = resJson;
          }
        }
      } catch (backendFetchErr) {
        console.info("Backend route unavailable, switching to browser AI engine.");
      }

      // 2. Fallback to client-side Gemini / Depth Psychology Engine
      if (!data) {
        data = await analyzeDreamDirectly(dreamContent.trim(), selectedStyle, selectedMood);
      }

      clearInterval(interval);

      if (!data || !data.success) {
        throw new Error("Failed to analyze dream.");
      }

      setResult(data);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "An unexpected error occurred while connecting to the AI agent.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (result?.visualizer?.imagePrompt) {
      navigator.clipboard.writeText(result.visualizer.imagePrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  const handleSaveToJournal = async () => {
    setSaveLoading(true);
    setSaveMessage(null);

    const dreamToSave = {
      _id: 'local_' + Date.now(),
      title: dreamTitle.trim() || 'My Visualized Dream',
      content: dreamContent.trim(),
      category: selectedMood.toLowerCase().includes('nightmare') ? 'nightmare' : (selectedMood.toLowerCase().includes('lucid') ? 'lucid' : 'normal'),
      mood: 4,
      tags: [selectedStyle.split(' ')[0], selectedMood.split(' ')[0]],
      isLucid: selectedMood.toLowerCase().includes('lucid'),
      isRecurring: false,
      date: new Date().toISOString().split('T')[0],
      imageUrl: result?.visualizer?.imageUrl || '',
      aiInterpretation: result?.psychology?.overview || ''
    };

    // If user is authenticated with a live backend, try saving to server
    if (user && API_BASE_URL) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dreams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(dreamToSave)
        });

        if (response.ok) {
          setIsSaved(true);
          setSaveMessage("✨ Successfully saved to your cloud Dream Journal!");
          setSaveLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not save to remote server, falling back to local journal:", err);
      }
    }

    // Save to local storage (works universally on GitHub Pages)
    try {
      const existing = JSON.parse(localStorage.getItem('local_dreams') || '[]');
      const updated = [dreamToSave, ...existing.filter(d => d.content !== dreamToSave.content)];
      localStorage.setItem('local_dreams', JSON.stringify(updated));
      setSavedDreams(updated);
      setIsSaved(true);
      setSaveMessage("✨ Successfully saved to your Dream Journal!");
    } catch (e) {
      setSaveMessage("Saved dream locally.");
      setIsSaved(true);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteSavedDream = (id) => {
    const updated = savedDreams.filter(d => d._id !== id);
    setSavedDreams(updated);
    localStorage.setItem('local_dreams', JSON.stringify(updated));
  };

  return (
    <div className="visualizer-container container">
      {/* Header */}
      <header className="page-header visualizer-header">
        <span className="badge-glow">✨ Public Interactive AI Tool</span>
        <h1>AI Dream Interpreter & Visualizer</h1>
        <p>
          Describe your subconscious experience. Our Gemini-powered agent decodes the psychological meaning and renders your custom dream visual.
        </p>

        {savedDreams.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <button
              type="button"
              className="btn-sample-chip"
              style={{ padding: '8px 16px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366f1', color: '#c7d2fe', fontWeight: 'bold' }}
              onClick={() => setShowSavedModal(true)}
            >
              📖 View Saved Dreams ({savedDreams.length})
            </button>
          </div>
        )}
      </header>

      {/* Main Interactive Form */}
      <section className="visualizer-form-card">
        <form onSubmit={handleGenerate}>
          {/* Dream Title (Optional) */}
          <div className="input-group">
            <label>Dream Title (optional):</label>
            <input
              type="text"
              placeholder="e.g. Flight over the Lavender Ocean..."
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
            />
          </div>

          {/* Dream Narrative */}
          <div className="input-group">
            <label>What did you experience in your dream? <span className="req">*</span></label>
            <textarea
              rows="5"
              placeholder="Describe your dream narrative in detail. What did you see, feel, or hear? Who was there? Where did you go?"
              value={dreamContent}
              onChange={(e) => setDreamContent(e.target.value)}
              required
            />
          </div>

          {/* Preset Prompts */}
          <div className="sample-prompts">
            <span className="sample-label">💡 Need inspiration? Try:</span>
            {SAMPLE_DREAMS.map((sample, idx) => (
              <button
                type="button"
                key={idx}
                className="btn-sample-chip"
                onClick={() => handleSampleClick(sample)}
              >
                Sample {idx + 1}
              </button>
            ))}
          </div>

          {/* Art Style Selector */}
          <div className="input-group">
            <label>Select Dream Art Style:</label>
            <div className="style-grid">
              {ART_STYLES.map((style) => (
                <button
                  type="button"
                  key={style.id}
                  className={`style-card ${selectedStyle === style.label ? 'active' : ''}`}
                  onClick={() => setSelectedStyle(style.label)}
                >
                  <span className="style-emoji">{style.emoji}</span>
                  <span className="style-label">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emotional Mood Selector */}
          <div className="input-group">
            <label>Dominant Emotional Mood:</label>
            <div className="mood-chips">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className={`mood-chip ${selectedMood === m.label ? 'active' : ''}`}
                  onClick={() => setSelectedMood(m.label)}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-alert">{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-visualize-submit"
            disabled={isLoading || !dreamContent.trim()}
          >
            {isLoading ? '🔮 Interpreting & Generating Artwork...' : '✨ Interpret & Visualize Dream'}
          </button>
        </form>
      </section>

      {/* Loading Progress State */}
      {isLoading && (
        <section className="loading-state-card">
          <div className="spinner-cosmic"></div>
          <h3>Unlocking Subconscious Imagery</h3>
          <p className="loading-step-text">{loadingMessages[loadingStep]}</p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}></div>
          </div>
        </section>
      )}

      {/* Results View */}
      {result && !isLoading && (
        <section className="visualizer-results">
          <div className="results-grid">
            {/* Left Column: Psychological Analysis */}
            <div className="card-result-panel psychology-panel">
              <div className="panel-badge">🧠 Psychological Analysis</div>
              <h2>Subconscious Deconstruction</h2>
              
              <div className="analysis-section">
                <h3>Core Meaning</h3>
                <p className="analysis-overview">{result.psychology?.overview}</p>
              </div>

              {result.psychology?.archetypes?.length > 0 && (
                <div className="analysis-section">
                  <h3>Jungian Archetypes Identified</h3>
                  <div className="archetype-list">
                    {result.psychology.archetypes.map((arch, idx) => (
                      <div key={idx} className="archetype-item">
                        <span className="archetype-name">🏛️ {arch.name}:</span>
                        <span className="archetype-desc">{arch.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.psychology?.keySymbols?.length > 0 && (
                <div className="analysis-section">
                  <h3>Dream Symbols Decoded</h3>
                  <div className="symbol-chips">
                    {result.psychology.keySymbols.map((item, idx) => (
                      <div key={idx} className="symbol-chip">
                        <strong>{item.symbol}</strong>
                        <span>{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.psychology?.journalPrompts?.length > 0 && (
                <div className="analysis-section">
                  <h3>Reflective Journal Prompts</h3>
                  <ul className="journal-prompts">
                    {result.psychology.journalPrompts.map((q, idx) => (
                      <li key={idx}>✍️ {q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.psychology?.colorPalette?.length > 0 && (
                <div className="analysis-section">
                  <h3>Subconscious Color Palette</h3>
                  <div className="color-palette-bar">
                    {result.psychology.colorPalette.map((hex, idx) => (
                      <div
                        key={idx}
                        className="palette-swatch"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      >
                        <span>{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: AI Artwork & Prompt */}
            <div className="card-result-panel artwork-panel">
              <div className="panel-badge">🎨 Dream Art Visualization</div>
              <h2>Visual Artwork</h2>

              {/* Generated Image Frame */}
              <div className="image-frame">
                <img
                  src={result.visualizer?.imageUrl}
                  alt="AI Dream Artwork"
                  className="generated-dream-image"
                  loading="lazy"
                />
              </div>

              {/* Image Actions */}
              <div className="artwork-button-group">
                <a
                  href={result.visualizer?.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-action-outline"
                >
                  🔍 View Full Size
                </a>

                <button
                  type="button"
                  className={`btn-action-primary ${isSaved ? 'btn-saved' : ''}`}
                  onClick={handleSaveToJournal}
                  disabled={saveLoading || isSaved}
                >
                  {saveLoading ? 'Saving...' : (isSaved ? '✅ Saved in Journal' : '💾 Save to Journal')}
                </button>
              </div>

              {saveMessage && <div className="save-feedback">{saveMessage}</div>}

              {/* AI Image Prompt Card */}
              <div className="prompt-display-box">
                <div className="prompt-header">
                  <span>🤖 Crafted AI Image Prompt</span>
                  <button type="button" className="btn-copy-prompt" onClick={handleCopyPrompt}>
                    {copiedPrompt ? '✅ Copied!' : '📋 Copy Prompt'}
                  </button>
                </div>
                <p className="prompt-text">{result.visualizer?.imagePrompt}</p>
                <div className="prompt-meta">
                  <span>Style: <strong>{result.visualizer?.artStyle}</strong></span>
                  <span>Engine: <strong>Imagen / FLUX Optimized</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Saved Dreams Modal / Drawer */}
      {showSavedModal && (
        <div className="modal-backdrop" onClick={() => setShowSavedModal(false)}>
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>📖 Your Saved Dream Journal ({savedDreams.length})</h2>
              <button className="btn-close" onClick={() => setShowSavedModal(false)}>✕</button>
            </div>

            {savedDreams.length === 0 ? (
              <p>No dreams saved yet. Generate a dream visual and click "Save to Journal"!</p>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {savedDreams.map((d) => (
                  <div key={d._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    {d.imageUrl && (
                      <img src={d.imageUrl} alt={d.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: '#c7d2fe' }}>{d.title}</h4>
                        <button
                          onClick={() => handleDeleteSavedDream(d._id)}
                          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                          title="Delete dream"
                        >
                          🗑️
                        </button>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0' }}>📅 {d.date} | Category: {d.category}</p>
                      <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: '8px 0' }}>{d.content}</p>
                      {d.aiInterpretation && (
                        <p style={{ fontSize: '0.85rem', color: '#a5b4fc', fontStyle: 'italic', margin: '4px 0' }}>💡 {d.aiInterpretation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public Callout Banner for Visitors */}
      {!user && (
        <section className="public-cta-banner">
          <h2>Track Your Subconscious Journey</h2>
          <p>
            Capture your dreams, track emotional patterns, view monthly heatmaps, and re-generate artwork anytime.
          </p>
          <div className="cta-buttons">
            <Link to="/about" className="btn-cta-signup">Learn About Jungian Dream Analysis</Link>
            <Link to="/contact" className="btn-cta-login">Contact & Feedback</Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default VisualizerPage;
