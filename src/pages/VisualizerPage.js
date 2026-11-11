import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { API_BASE_URL } from '../config';
import DreamGuideSection from '../components/DreamGuideSection';
import {
  analyzeDreamDirectly,
  getSavedUserGeminiKey,
  setSavedUserGeminiKey
} from '../utils/dreamAnalyzer';
import {
  getLocalDreams,
  createLocalDreamEntry,
  deleteLocalDream,
  isUnavailableBackendResponse
} from '../utils/localDreamStore';

const ART_STYLES = [
  { id: 'surrealism', label: 'Surrealism (Dalí)', emoji: '🎨' },
  { id: 'watercolor', label: 'Ethereal Watercolor', emoji: '🌊' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', emoji: '🌌' },
  { id: 'ghibli', label: 'Studio Ghibli', emoji: '🍃' },
  { id: 'gothic', label: 'Dark Gothic Fantasy', emoji: '🕯️' },
  { id: 'oil', label: 'Vintage Oil Painting', emoji: '🖼️' },
  { id: 'cosmic', label: 'Cosmic Psychedelic', emoji: '✨' }
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

  const [dreamContent, setDreamContent] = useState('');
  const [dreamTitle, setDreamTitle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(ART_STYLES[0].label);
  const [selectedMood, setSelectedMood] = useState(MOODS[0].label);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  
  const [result, setResult] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const [showKeySettings, setShowKeySettings] = useState(false);
  const [personalGeminiKey, setPersonalGeminiKey] = useState('');
  const [keyStatusMsg, setKeyStatusMsg] = useState('');

  const [savedDreams, setSavedDreams] = useState([]);
  const [showSavedModal, setShowSavedModal] = useState(false);

  useEffect(() => {
    setSavedDreams(getLocalDreams());
    setPersonalGeminiKey(getSavedUserGeminiKey());
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

  const handleSaveKey = () => {
    setSavedUserGeminiKey(personalGeminiKey);
    setKeyStatusMsg(personalGeminiKey.trim()
      ? 'Personal key saved locally in your browser.'
      : 'Personal key cleared; using built-in Depth Psychology engine.');
    setTimeout(() => setKeyStatusMsg(''), 3000);
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
    setImageLoaded(false);
    setImageError(false);
    setIsSaved(false);
    setSaveMessage(null);

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % loadingMessages.length;
      setLoadingStep(step);
    }, 1500);

    try {
      let data = null;

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

        if (response.ok && !isUnavailableBackendResponse(response)) {
          const resJson = await response.json();
          if (resJson.success) {
            data = resJson;
          }
        }
      } catch (backendFetchErr) {
        console.info("Backend API unavailable, using client-side AI visualizer engine.");
      }

      if (!data) {
        data = await analyzeDreamDirectly(
          dreamContent.trim(),
          selectedStyle,
          selectedMood,
          personalGeminiKey
        );
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

  const handleRetryImage = () => {
    if (!result?.visualizer?.cleanPrompt) return;
    const newSeed = Math.floor(Math.random() * 999999);
    const refreshedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(result.visualizer.cleanPrompt)}?width=1024&height=1024&nologo=true&seed=${newSeed}`;
    setImageError(false);
    setImageLoaded(false);
    setResult((prev) => ({
      ...prev,
      visualizer: {
        ...prev.visualizer,
        imageUrl: refreshedUrl,
        seed: newSeed
      }
    }));
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

    if (user && !user.isLocal) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dreams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(dreamToSave)
        });

        if (response.ok && !isUnavailableBackendResponse(response)) {
          setIsSaved(true);
          setSaveMessage("✨ Successfully saved to your cloud Dream Journal!");
          setSaveLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Could not save to remote server, falling back to local journal:", err);
      }
    }

    try {
      const { dreams } = createLocalDreamEntry(dreamToSave);
      setSavedDreams(dreams);
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
    setSavedDreams(deleteLocalDream(id));
  };

  return (
    <div className="visualizer-container container">
      {/* Header */}
      <header className="page-header visualizer-header">
        <span className="badge-glow">✨ Public Interactive AI Tool</span>
        <h1>AI Dream Interpreter &amp; Visualizer</h1>
        <p>
          Describe your subconscious experience. Our intelligent dream analyst decodes its psychological meaning and renders custom dream artwork.
        </p>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {savedDreams.length > 0 && (
            <button
              type="button"
              className="btn-sample-chip"
              style={{ padding: '8px 16px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366f1', color: '#c7d2fe', fontWeight: 'bold' }}
              onClick={() => setShowSavedModal(true)}
            >
              📖 View Saved Dreams ({savedDreams.length})
            </button>
          )}
          <button
            type="button"
            className="btn-sample-chip"
            onClick={() => setShowKeySettings(!showKeySettings)}
          >
            ⚙️ {personalGeminiKey ? 'Gemini Key Connected' : 'AI Engine Settings'}
          </button>
        </div>

        {showKeySettings && (
          <div style={{
            marginTop: '14px',
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            maxWidth: '580px',
            marginInline: 'auto',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: '0.88rem', marginBottom: '8px', color: '#cbd5e1' }}>
              Works automatically out of the box. Optionally connect your own Google Gemini API key (stored strictly in your own browser for enhanced LLM analysis):
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="password"
                placeholder="Paste personal Gemini API key (optional)..."
                value={personalGeminiKey}
                onChange={(e) => setPersonalGeminiKey(e.target.value)}
                style={{ flex: 1, minWidth: '220px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
              />
              <button type="button" className="btn-sample-chip" onClick={handleSaveKey}>
                Save Key
              </button>
            </div>
            {keyStatusMsg && (
              <p style={{ fontSize: '0.82rem', color: '#86efac', marginTop: '6px' }}>{keyStatusMsg}</p>
            )}
          </div>
        )}
      </header>

      {/* Main Interactive Form */}
      <section className="visualizer-form-card">
        <form onSubmit={handleGenerate}>
          <div className="input-group">
            <label>Dream Title (optional):</label>
            <input
              type="text"
              placeholder="e.g. Flight over the Lavender Ocean..."
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
            />
          </div>

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

          <div className="selection-section">
            <label>Select Dream Art Style:</label>
            <div className="style-chips-grid">
              {ART_STYLES.map((style) => (
                <button
                  type="button"
                  key={style.id}
                  className={`style-chip ${selectedStyle === style.label ? 'active' : ''}`}
                  onClick={() => setSelectedStyle(style.label)}
                >
                  <span className="chip-emoji">{style.emoji}</span>
                  <span className="chip-label">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="selection-section">
            <label>Dominant Emotional Mood:</label>
            <div className="mood-chips-row">
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

          <div className="action-row">
            <button
              type="submit"
              className="btn-visualize-submit"
              disabled={isLoading || !dreamContent.trim()}
            >
              {isLoading ? '🔮 Interpreting & Generating Artwork...' : '✨ Interpret & Visualize Dream'}
            </button>
          </div>
        </form>
      </section>

      {/* Loading Progress State */}
      {isLoading && (
        <section className="visualizer-loading-card">
          <div className="spinner-orbit"></div>
          <p className="loading-text">Unlocking Subconscious Imagery</p>
          <p className="loading-sub">{loadingMessages[loadingStep]}</p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}></div>
          </div>
        </section>
      )}

      {/* Results View */}
      {result && !isLoading && (
        <section className="visualizer-results-grid">
          {/* Left Column: Psychological Analysis */}
          <div className="result-card">
            <div className="card-badge">🧠 Psychological Analysis</div>
            <h2>Subconscious Deconstruction</h2>
            
            <div className="psych-sub-block">
              <h3>Core Meaning</h3>
              <p className="psychology-overview">{result.psychology?.overview}</p>
            </div>

            {result.psychology?.archetypes?.length > 0 && (
              <div className="psych-sub-block">
                <h3>Jungian Archetypes Identified</h3>
                <div className="archetypes-list">
                  {result.psychology.archetypes.map((arch, idx) => (
                    <div key={idx} className="archetype-item">
                      <strong>🏛️ {arch.name}</strong>
                      <span>{arch.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.psychology?.keySymbols?.length > 0 && (
              <div className="psych-sub-block">
                <h3>Dream Symbols Decoded</h3>
                <div className="symbols-list">
                  {result.psychology.keySymbols.map((item, idx) => (
                    <div key={idx} className="symbol-pill">
                      <span className="symbol-name">{item.symbol}</span>
                      <span className="symbol-meaning">{item.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.psychology?.journalPrompts?.length > 0 && (
              <div className="psych-sub-block">
                <h3>Reflective Journal Prompts</h3>
                <ul className="prompts-list">
                  {result.psychology.journalPrompts.map((q, idx) => (
                    <li key={idx}>✍️ {q}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.psychology?.colorPalette?.length > 0 && (
              <div className="psych-sub-block">
                <h3>Subconscious Color Palette</h3>
                <div className="palette-row">
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
          <div className="result-card">
            <div className="card-badge">🎨 Dream Art Visualization</div>
            <h2>Visual Artwork</h2>

            <div className="image-frame" style={{ position: 'relative' }}>
              {!imageLoaded && !imageError && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#cbd5e1'
                }}>
                  <div className="spinner-orbit"></div>
                  <p className="loading-sub" style={{ marginTop: '8px' }}>Rendering custom dream artwork...</p>
                </div>
              )}

              {imageError ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#cbd5e1'
                }}>
                  <p style={{ marginBottom: '12px' }}>The image renderer took too long or is busy.</p>
                  <button type="button" className="btn-action-outline" style={{ flex: 'none' }} onClick={handleRetryImage}>
                    🔄 Retry Artwork Render
                  </button>
                </div>
              ) : (
                <img
                  src={result.visualizer?.imageUrl}
                  alt="AI Dream Artwork"
                  className="generated-dream-image"
                  style={{ display: imageLoaded ? 'block' : 'none' }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageLoaded(false);
                    setImageError(true);
                  }}
                />
              )}
            </div>

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

            {saveMessage && (
              <div className="save-feedback">
                {saveMessage}{' '}
                <Link to="/journal" style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'underline' }}>
                  Open Journal Archive
                </Link>
              </div>
            )}

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
                <span>Engine: <strong>FLUX / Diffusion Optimized</strong></span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Saved Dreams Modal */}
      {showSavedModal && (
        <div className="modal-backdrop" onClick={() => setShowSavedModal(false)}>
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>📖 Your Saved Dream Journal ({savedDreams.length})</h2>
              <button className="btn-close" onClick={() => setShowSavedModal(false)}>✕</button>
            </div>

            {savedDreams.length === 0 ? (
              <p>No dreams saved yet. Generate a dream visual and click &quot;Save to Journal&quot;!</p>
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
            Capture your dreams, track emotional patterns, view monthly heatmaps, and explore symbolism anytime.
          </p>
          <div className="cta-buttons">
            <Link to="/journal" className="btn-cta-signup">Open Dream Archive</Link>
            <Link to="/about" className="btn-cta-login">Learn Methodology</Link>
          </div>
        </section>
      )}

      {/* Rich Editorial Symbolism Guide & FAQ */}
      <DreamGuideSection
        onSelectPromptSample={(sample) => {
          handleSampleClick(sample);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default VisualizerPage;
