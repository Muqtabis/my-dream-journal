import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SYMBOL_ENCYCLOPEDIA = [
  {
    icon: '🌊',
    title: 'Water, Oceans & Floods',
    archetype: 'The Unconscious Psyche',
    summary:
      'Water is one of the most universal symbols of emotion and the subconscious mind. Calm, luminous water often signals emotional clarity and intuitive depth, whereas turbulent waves or rising tides suggest unacknowledged feelings asking for conscious attention.',
    reflection: 'Ask yourself: What emotions in waking life feel vast, deep, or hard to contain right now?'
  },
  {
    icon: '🕊️',
    title: 'Flying & Weightlessness',
    archetype: 'Transcendence & Autonomy',
    summary:
      'Dreaming of flight commonly surfaces during periods of personal breakthrough or a desire to rise above restrictive routines. Effortless gliding correlates with confidence and creative freedom, while struggling to stay airborne mirrors fear of losing momentum.',
    reflection: 'Ask yourself: Where do you crave more independence or higher perspective?'
  },
  {
    icon: '🚪',
    title: 'Doors, Keys & Thresholds',
    archetype: 'The Liminal Passage',
    summary:
      'Locked doors, hidden hallways, and unfamiliar staircases mark psychological transitions. Discovering a new room inside a familiar house frequently represents an untapped talent, memory, or phase of personal identity ready to open.',
    reflection: 'Ask yourself: What new opportunity or boundary are you standing in front of this week?'
  },
  {
    icon: '🪞',
    title: 'Mirrors & Reflections',
    archetype: 'Persona vs. Authentic Self',
    summary:
      'Looking into a mirror—especially when the reflection acts independently or looks unfamiliar—highlights tension between the social mask you wear daily and your inner truth. Analytical psychology views this as an invitation toward honest self-acceptance.',
    reflection: 'Ask yourself: Which parts of yourself do you present to others versus keep hidden?'
  },
  {
    icon: '🌑',
    title: 'Being Chased or Pursued',
    archetype: 'The Shadow',
    summary:
      'Pursuit dreams rarely predict literal danger; instead, the pursuing figure often personifies an avoided responsibility, suppressed emotion, or disowned strength ("The Shadow"). Turning to face the figure inside a lucid dream often transforms fear into insight.',
    reflection: 'Ask yourself: What uncomfortable conversation, habit, or truth have you been outrunning?'
  },
  {
    icon: '⏳',
    title: 'Melting Clocks & Missed Trains',
    archetype: 'Temporal Urgency',
    summary:
      'Distorted timepieces, late departures, and endless corridors tend to surface during major life deadlines or fear of missed opportunities. They reveal internal pressure around pacing rather than actual failure.',
    reflection: 'Ask yourself: Are you measuring your progress against external expectations or personal values?'
  },
  {
    icon: '📚',
    title: 'Libraries, Books & Whispers',
    archetype: 'The Inner Archive',
    summary:
      'Infinite libraries and living books symbolize accumulated life wisdom, memory consolidation during REM sleep, and questions seeking structured meaning.',
    reflection: 'Ask yourself: What forgotten curiosity or lesson from your past feels relevant again today?'
  },
  {
    icon: '🌲',
    title: 'Forests, Labyrinths & Night Skies',
    archetype: 'The Journey of Individuation',
    summary:
      'Dense woods and winding paths represent stepping outside predictable routines into creative uncertainty. Starlit skies and moons inside those landscapes act as guiding intuition.',
    reflection: 'Ask yourself: How comfortable are you navigating ambiguity without an immediate map?'
  }
];

const FAQ_ITEMS = [
  {
    q: 'How does Jungian dream interpretation differ from generic dream dictionaries?',
    a: 'Traditional dream dictionaries assign rigid one-word meanings (for example, claiming snakes always mean betrayal). Analytical depth psychology treats symbols as personal and contextual—an ocean can mean peace to a swimmer or overwhelm to someone facing life change. Our interpreter pairs symbolic motifs with your chosen emotional mood and reflective journaling prompts so you uncover your own personal meaning.'
  },
  {
    q: 'Are dream interpretations scientific or medical advice?',
    a: 'No. Dream analysis and symbolic visualization are designed strictly for self-reflection, creative journaling, mindfulness, and entertainment. They are not substitutes for clinical psychology, psychiatric care, or medical diagnosis.'
  },
  {
    q: 'Why visualize a dream as artwork and an AI image prompt?',
    a: 'Dreams communicate primarily through vivid sensory imagery rather than linear sentences. Translating a fragmented dream into concrete visual elements—lighting, palette, composition, and artistic style—helps cement dream recall before it fades upon waking and lets you preserve a visual dream archive.'
  },
  {
    q: 'How is my privacy protected when I write and save dreams?',
    a: 'Dreams saved while using the static web app remain strictly inside your browser storage on your own device unless you connect to an authenticated cloud backend. We never sell personal dream narratives to third-party data brokers.'
  },
  {
    q: 'How can I improve dream recall and lucid dreaming?',
    a: 'Keep your journal accessible immediately upon waking, record even brief fragments or emotional moods before checking messages, tag recurring motifs in the Dream Archive, and review your monthly patterns on the Deep Dream Insights page.'
  }
];

/**
 * Rich educational section covering Jungian dream methodology,
 * searchable common symbols encyclopedia, and frequently asked questions.
 */
const DreamGuideSection = ({ onSelectPromptSample }) => {
  const [symbolFilter, setSymbolFilter] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const visibleSymbols = SYMBOL_ENCYCLOPEDIA.filter((item) => {
    if (!symbolFilter.trim()) return true;
    const q = symbolFilter.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.archetype.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dream-guide-wrapper">
      {/* Methodology Overview */}
      <section className="guide-section-card">
        <div className="guide-section-header">
          <span className="card-badge">📘 Depth Psychology Guide</span>
          <h2>How Dream Interpretation &amp; Visual Synthesis Work</h2>
          <p>
            Every night during REM sleep, the brain weaves waking memories, unspoken emotions, and universal archetypes into vivid internal theater. Decoding those motifs turns fleeting sleep narratives into practical self-awareness.
          </p>
        </div>

        <div className="methodology-steps-grid">
          <article className="methodology-step-card">
            <div className="step-num">01</div>
            <h3>Capture Before Fading</h3>
            <p>
              Record raw sensory fragments—colors, places, unexpected transitions, and how the dream felt—within the first minutes of waking before analytical filtering edits the memory.
            </p>
          </article>

          <article className="methodology-step-card">
            <div className="step-num">02</div>
            <h3>Decode Archetypes &amp; Mood</h3>
            <p>
              Pair recurring motifs (waters, thresholds, shadows, flight) with emotional tone. The same symbol carries a completely different message under calm curiosity than under anxiety.
            </p>
          </article>

          <article className="methodology-step-card">
            <div className="step-num">03</div>
            <h3>Anchor Memory Visually</h3>
            <p>
              Distilling your dream into a dedicated color palette, creative image prompt, and artwork turns intangible thoughts into memorable entries inside your <Link to="/journal">Dream Archive</Link>.
            </p>
          </article>
        </div>
      </section>

      {/* Searchable Dream Symbols Encyclopedia */}
      <section className="guide-section-card">
        <div className="guide-section-header">
          <span className="card-badge">🔮 Reference Encyclopedia</span>
          <h2>Common Dream Symbols &amp; Psychological Meanings</h2>
          <p>Explore classic dream motifs drawn from depth psychology, or filter below by theme.</p>

          <div className="symbol-search-bar">
            <input
              type="text"
              placeholder="Filter symbols (e.g., water, flying, shadow, mirror)..."
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              aria-label="Filter dream symbols"
            />
          </div>
        </div>

        <div className="encyclopedia-grid">
          {visibleSymbols.map((item) => (
            <article key={item.title} className="encyclopedia-card">
              <div className="encyclopedia-top">
                <span className="encyclopedia-icon">{item.icon}</span>
                <div>
                  <h3>{item.title}</h3>
                  <span className="encyclopedia-archetype">{item.archetype}</span>
                </div>
              </div>
              <p className="encyclopedia-summary">{item.summary}</p>
              <p className="encyclopedia-reflection">✍️ {item.reflection}</p>
              {onSelectPromptSample && (
                <button
                  type="button"
                  className="btn-sample-chip"
                  style={{ marginTop: '10px' }}
                  onClick={() =>
                    onSelectPromptSample(
                      `I dreamed about ${item.title.toLowerCase()} where everything felt vivid and symbolic.`
                    )
                  }
                >
                  Use Motif in Visualizer
                </button>
              )}
            </article>
          ))}
        </div>

        {visibleSymbols.length === 0 && (
          <p className="empty-chart-message">No matching dream symbols found for &quot;{symbolFilter}&quot;.</p>
        )}
      </section>

      {/* Frequently Asked Questions */}
      <section className="guide-section-card">
        <div className="guide-section-header">
          <span className="card-badge">❓ Helpful Answers</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-accordion">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={faq.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <p className="faq-answer">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DreamGuideSection;
