import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { API_BASE_URL } from '../config';

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
      const response = await fetch(`${API_BASE_URL}/api/ai/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamContent: dreamContent.trim(),
          artStyle: selectedStyle,
          mood: selectedMood
        })
      });

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze dream.");
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
    if (!user) {
      localStorage.setItem('pending_saved_dream', JSON.stringify({
        title: dreamTitle || 'Visualized Dream',
        content: dreamContent,
        imageUrl: result?.visualizer?.imageUrl,
        aiInterpretation: result?.psychology?.overview,
        category: selectedMood.toLowerCase().includes('nightmare') ? 'nightmare' : 'normal'
      }));
      navigate('/login');
      return;
    }

    setSaveLoading(true);
    setSaveMessage(null);

    try {
      const payload = {
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

      const response = await fetch(`${API_BASE_URL}/api/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();

      if (response.ok) {
        setIsSaved(true);
        setSaveMessage("✨ Successfully saved to your Dream Journal!");
      } else {
        setSaveMessage(`Failed to save: ${json.error || 'Server error'}`);
      }
    } catch (err) {
      setSaveMessage("Could not save to server. Please try again.");
    } finally {
      setSaveLoading(false);
    }
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

          {/* Art Style Picker */}
          <div className="selection-section">
            <label>🎨 Choose Visual Art Style:</label>
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

          {/* Emotional Tone / Mood Picker */}
          <div className="selection-section">
            <label>🔮 Dream Emotion / Tone:</label>
            <div className="mood-chips-row">
              {MOODS.map((mood) => (
                <button
                  type="button"
                  key={mood.id}
                  className={`mood-chip ${selectedMood === mood.label ? 'active' : ''}`}
                  onClick={() => setSelectedMood(mood.label)}
                >
                  <span>{mood.emoji} {mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {/* Submit Action */}
          <div className="action-row">
            <button type="submit" className="btn-visualize-submit" disabled={isLoading}>
              {isLoading ? '🔮 Channeling Dream Matrix...' : '✨ Interpret & Visualize Dream'}
            </button>
          </div>
        </form>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="visualizer-loading-card">
            <div className="spinner-orbit"></div>
            <p className="loading-text">{loadingMessages[loadingStep]}</p>
            <span className="loading-sub">Analyzing subconscious archetypes...</span>
          </div>
        )}
      </section>

      {/* Results View */}
      {result && (
        <section className="visualizer-results-grid">
          {/* Left Column: Psychological Meaning */}
          <div className="result-column psychology-column">
            <div className="result-card">
              <div className="card-badge">🧠 Psychological Analysis</div>
              <h2>Subconscious Meaning</h2>
              <p className="psychology-overview">{result.psychology?.overview}</p>

              {/* Archetypes */}
              {result.psychology?.archetypes?.length > 0 && (
                <div className="psych-sub-block">
                  <h3>🎭 Identified Archetypes</h3>
                  <div className="archetypes-list">
                    {result.psychology.archetypes.map((arch, idx) => (
                      <div key={idx} className="archetype-item">
                        <strong>{arch.name}</strong>
                        <span>{arch.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Symbols */}
              {result.psychology?.keySymbols?.length > 0 && (
                <div className="psych-sub-block">
                  <h3>🔮 Symbolic Decoders</h3>
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

              {/* Actionable Journal Prompts */}
              {result.psychology?.journalPrompts?.length > 0 && (
                <div className="psych-sub-block">
                  <h3>✍️ Reflective Journal Prompts</h3>
                  <ul className="prompts-list">
                    {result.psychology.journalPrompts.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color Palette */}
              {result.psychology?.colorPalette?.length > 0 && (
                <div className="psych-sub-block">
                  <h3>🎨 Dream Mood Palette</h3>
                  <div className="palette-row">
                    {result.psychology.colorPalette.map((color, idx) => (
                      <div key={idx} className="palette-swatch" style={{ background: color }} title={color}>
                        <span>{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Artwork & Prompt */}
          <div className="result-column artwork-column">
            <div className="result-card artwork-card">
              <div className="card-badge">🖼️ Rendered Dreamscape</div>
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
                  {saveLoading ? 'Saving...' : (isSaved ? '✅ Saved in Journal' : (user ? '💾 Save to My Journal' : '🔒 Log In to Save'))}
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

      {/* Public Callout Banner for Visitors */}
      {!user && (
        <section className="public-cta-banner">
          <h2>Track Your Subconscious Journey</h2>
          <p>
            Create your free private journal to archive your dreams, track emotional patterns, view monthly heatmaps, and re-generate artwork anytime.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-cta-signup">Create Free Journal Account</Link>
            <Link to="/login" className="btn-cta-login">Existing User? Log In</Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default VisualizerPage;
